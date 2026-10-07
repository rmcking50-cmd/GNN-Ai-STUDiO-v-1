import { Pool, PoolConfig, QueryResult } from 'pg';
import { GeneratedScript, ScriptAuditLog } from '../types';
import {
  CLOUD_SQL_TARGET_REGION,
  DEFAULT_CLOUDSQL_CONNECTION_CONFIG,
  getCloudSqlDatabasePool,
  verifyCloudSqlStorageConnection,
  ensurePersistentStorageSchema,
  CloudSqlDiagnosticReport,
} from './connection';

export interface CloudSqlConfig {
  projectId: string;
  region: string;
  instanceName: string;
  database: string;
  user: string;
  password?: string;
  host?: string;
  port?: number;
  ssl?: boolean | object;
  maxConnections?: number;
  connectionTimeoutMillis?: number;
}

export interface CloudSqlStatus {
  connected: boolean;
  region: string;
  instanceConnectionName: string;
  database: string;
  user: string;
  driver: string;
  poolActive: number;
  poolIdle: number;
  poolTotal: number;
  lastChecked: string;
  latencyMs?: number;
  error?: string;
  isMockFallback?: boolean;
}

// Default Google Cloud SQL Configuration tailored for asia-southeast1 (Singapore)
export const DEFAULT_CLOUDSQL_CONFIG: CloudSqlConfig = {
  projectId: DEFAULT_CLOUDSQL_CONNECTION_CONFIG.projectId,
  region: DEFAULT_CLOUDSQL_CONNECTION_CONFIG.region,
  instanceName: DEFAULT_CLOUDSQL_CONNECTION_CONFIG.instanceName,
  database: DEFAULT_CLOUDSQL_CONNECTION_CONFIG.database,
  user: DEFAULT_CLOUDSQL_CONNECTION_CONFIG.user,
  password: DEFAULT_CLOUDSQL_CONNECTION_CONFIG.password,
  host: DEFAULT_CLOUDSQL_CONNECTION_CONFIG.host,
  port: DEFAULT_CLOUDSQL_CONNECTION_CONFIG.port,
  ssl: DEFAULT_CLOUDSQL_CONNECTION_CONFIG.ssl,
  maxConnections: DEFAULT_CLOUDSQL_CONNECTION_CONFIG.maxConnections,
  connectionTimeoutMillis: DEFAULT_CLOUDSQL_CONNECTION_CONFIG.connectionTimeoutMillis,
};

let isSchemaInitialized = false;

// Resilient in-memory fallback store to ensure seamless UI continuity if DB is provisioning
const inMemoryStore = {
  scripts: new Map<string, GeneratedScript>(),
  auditLogs: [] as ScriptAuditLog[],
  analyticsSnapshots: [] as any[],
};

export { getCloudSqlInstanceConnectionName } from './connection';

/**
 * Returns or initializes the PostgreSQL Pool connection to Google Cloud SQL
 */
export function getCloudSqlPool(customConfig?: Partial<CloudSqlConfig>): Pool {
  return getCloudSqlDatabasePool(customConfig as any);
}

/**
 * Health check & diagnostic inspector for Google Cloud SQL in asia-southeast1
 */
export async function checkCloudSqlConnection(customConfig?: Partial<CloudSqlConfig>): Promise<CloudSqlStatus> {
  const report = await verifyCloudSqlStorageConnection(customConfig as any);
  return {
    connected: report.connected,
    region: report.region,
    instanceConnectionName: report.instanceConnectionName,
    database: report.database,
    user: report.user,
    driver: report.driver,
    poolActive: report.poolActive,
    poolIdle: report.poolIdle,
    poolTotal: report.poolTotal,
    lastChecked: report.timestamp,
    latencyMs: report.latencyMs,
    error: report.error,
    isMockFallback: report.isMockFallback,
  };
}

/**
 * Initialize Cloud SQL Database Schemas for persistent Script & Analytics storage
 */
export async function initCloudSqlSchema(): Promise<boolean> {
  if (isSchemaInitialized) return true;
  const res = await ensurePersistentStorageSchema();
  if (res.initialized) {
    isSchemaInitialized = true;
    console.log(`[Google Cloud SQL (${DEFAULT_CLOUDSQL_CONFIG.region})] Persistent schema successfully verified.`);
    return true;
  } else {
    console.warn(`[Google Cloud SQL (${DEFAULT_CLOUDSQL_CONFIG.region})] Schema auto-init notice (running in resilient fallback mode):`, res.error);
    return false;
  }
}

/**
 * Execute a safe parameterized query against Cloud SQL with in-memory resilient fallback
 */
export async function executeCloudSqlQuery<T = any>(text: string, params: any[] = []): Promise<QueryResult<T> | null> {
  try {
    const pool = getCloudSqlPool();
    return await pool.query<T>(text, params);
  } catch (err: any) {
    console.warn(`[Google Cloud SQL Query] Query fallback activated: ${err.message}`);
    return null;
  }
}

/**
 * Persist or update a script in Google Cloud SQL
 */
export async function persistScriptToCloudSql(script: GeneratedScript): Promise<boolean> {
  // Always update in-memory fallback cache
  inMemoryStore.scripts.set(script.id, script);

  try {
    const query = `
      INSERT INTO gnn_scripts (
        id, title, headline, hook, body, outro, voiceover_text,
        language, status, author, reviewer, review_notes,
        created_at, submitted_at, reviewed_at, updated_at
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, NOW())
      ON CONFLICT (id) DO UPDATE SET
        title = EXCLUDED.title,
        headline = EXCLUDED.headline,
        hook = EXCLUDED.hook,
        body = EXCLUDED.body,
        outro = EXCLUDED.outro,
        voiceover_text = EXCLUDED.voiceover_text,
        language = EXCLUDED.language,
        status = EXCLUDED.status,
        author = EXCLUDED.author,
        reviewer = EXCLUDED.reviewer,
        review_notes = EXCLUDED.review_notes,
        submitted_at = EXCLUDED.submitted_at,
        reviewed_at = EXCLUDED.reviewed_at,
        updated_at = NOW()
    `;

    const params = [
      script.id,
      script.title || script.headline || 'Untitled Script',
      script.headline || '',
      script.hook || '',
      script.body || '',
      script.outro || '',
      script.voiceoverText || '',
      script.language || 'English',
      script.status || 'pending_review',
      script.author || 'GNN Editorial Staff',
      script.reviewedBy || null,
      script.reviewNotes || null,
      script.createdAt ? new Date(script.createdAt) : new Date(),
      script.submittedForReviewAt ? new Date(script.submittedForReviewAt) : null,
      script.reviewedAt ? new Date(script.reviewedAt) : null,
    ];

    const res = await executeCloudSqlQuery(query, params);
    return res !== null;
  } catch (err: any) {
    console.warn(`[Cloud SQL Script Save] Error persisting script to Cloud SQL (${DEFAULT_CLOUDSQL_CONFIG.region}):`, err.message);
    return false;
  }
}

/**
 * Retrieve all scripts from Google Cloud SQL (or in-memory cache)
 */
export async function getScriptsFromCloudSql(): Promise<GeneratedScript[]> {
  try {
    const res = await executeCloudSqlQuery(`
      SELECT 
        id, title, headline, hook, body, outro, 
        voiceover_text as "voiceoverText", 
        language, status, author, 
        reviewer as "reviewedBy", 
        review_notes as "reviewNotes",
        created_at as "createdAt",
        submitted_at as "submittedForReviewAt",
        reviewed_at as "reviewedAt"
      FROM gnn_scripts
      ORDER BY created_at DESC
    `);

    if (res && res.rows && res.rows.length > 0) {
      return res.rows.map(r => ({
        ...r,
        createdAt: r.createdAt ? new Date(r.createdAt).toISOString() : undefined,
        submittedForReviewAt: r.submittedForReviewAt ? new Date(r.submittedForReviewAt).toISOString() : undefined,
        reviewedAt: r.reviewedAt ? new Date(r.reviewedAt).toISOString() : undefined,
      }));
    }
  } catch (err: any) {
    console.warn(`[Cloud SQL Script Fetch] Error querying Cloud SQL:`, err.message);
  }

  // Return from in-memory store
  return Array.from(inMemoryStore.scripts.values());
}

/**
 * Persist Audit Log entry to Google Cloud SQL
 */
export async function persistAuditLogToCloudSql(log: ScriptAuditLog): Promise<boolean> {
  inMemoryStore.auditLogs.unshift(log);

  try {
    const query = `
      INSERT INTO gnn_script_audit_logs (
        id, script_id, script_title, action, previous_status, new_status, reviewer, reviewer_role, notes, created_at
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
    `;
    const params = [
      log.id,
      log.scriptId,
      log.scriptTitle,
      log.action,
      log.previousStatus || null,
      log.newStatus,
      log.reviewer,
      log.reviewerRole || 'Executive Reviewer',
      log.notes || null,
      log.timestamp ? new Date(log.timestamp) : new Date(),
    ];

    const res = await executeCloudSqlQuery(query, params);
    return res !== null;
  } catch (err: any) {
    console.warn(`[Cloud SQL Audit Save] Error:`, err.message);
    return false;
  }
}

/**
 * Retrieve Audit Logs from Google Cloud SQL
 */
export async function getAuditLogsFromCloudSql(): Promise<ScriptAuditLog[]> {
  try {
    const res = await executeCloudSqlQuery(`
      SELECT 
        id, script_id as "scriptId", script_title as "scriptTitle", 
        action, previous_status as "previousStatus", new_status as "newStatus", 
        reviewer, reviewer_role as "reviewerRole", notes, created_at as "timestamp"
      FROM gnn_script_audit_logs
      ORDER BY created_at DESC
      LIMIT 100
    `);

    if (res && res.rows && res.rows.length > 0) {
      return res.rows.map(r => ({
        ...r,
        timestamp: r.timestamp ? new Date(r.timestamp).toISOString() : new Date().toISOString(),
      }));
    }
  } catch (err: any) {
    console.warn(`[Cloud SQL Audit Fetch] Error:`, err.message);
  }

  return inMemoryStore.auditLogs;
}

/**
 * Persist an Analytics Snapshot to Google Cloud SQL
 */
export async function persistAnalyticsSnapshotToCloudSql(snapshot: {
  timeframe: string;
  platform: string;
  metrics: {
    views: number;
    reach: number;
    likes: number;
    shares: number;
    comments: number;
    activeViewers: number;
  };
  scriptsCount: number;
  postsCount: number;
  payload?: any;
}): Promise<boolean> {
  const id = `snap-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`;
  inMemoryStore.analyticsSnapshots.unshift({ id, ...snapshot, createdAt: new Date().toISOString() });

  try {
    const query = `
      INSERT INTO gnn_analytics_snapshots (
        id, timeframe, platform, total_views, total_reach, total_likes,
        total_shares, total_comments, active_viewers, scripts_count, posts_count, payload, created_at
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, NOW())
    `;
    const params = [
      id,
      snapshot.timeframe,
      snapshot.platform,
      snapshot.metrics.views,
      snapshot.metrics.reach,
      snapshot.metrics.likes,
      snapshot.metrics.shares,
      snapshot.metrics.comments,
      snapshot.metrics.activeViewers,
      snapshot.scriptsCount,
      snapshot.postsCount,
      JSON.stringify(snapshot.payload || {}),
    ];

    const res = await executeCloudSqlQuery(query, params);
    return res !== null;
  } catch (err: any) {
    console.warn(`[Cloud SQL Analytics Save] Error:`, err.message);
    return false;
  }
}
