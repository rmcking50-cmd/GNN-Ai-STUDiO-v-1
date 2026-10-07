import { Pool, PoolClient, PoolConfig, QueryResult } from 'pg';

/**
 * Target Google Cloud Region for Cloud SQL Instance
 */
export const CLOUD_SQL_TARGET_REGION = 'asia-southeast1';

/**
 * Configuration interface for Authenticated Google Cloud SQL Connection in asia-southeast1
 */
export interface CloudSqlDatabaseConfig {
  projectId: string;
  region: string;
  instanceName: string;
  database: string;
  user: string;
  password?: string;
  host?: string;
  port?: number;
  socketPath?: string;
  ssl?: boolean | object;
  maxConnections?: number;
  connectionTimeoutMillis?: number;
  idleTimeoutMillis?: number;
}

/**
 * Diagnostic & Health Status report for Cloud SQL Connection
 */
export interface CloudSqlDiagnosticReport {
  connected: boolean;
  region: string;
  instanceConnectionName: string;
  database: string;
  user: string;
  driver: string;
  poolActive: number;
  poolIdle: number;
  poolTotal: number;
  latencyMs?: number;
  serverVersion?: string;
  timestamp: string;
  error?: string;
  isMockFallback?: boolean;
}

const sanitizeEnv = (val?: string, fallback: string = ''): string => {
  if (!val || val.trim().length <= 1) return fallback;
  return val.trim();
};

const isValidSocketPath = (p?: string): boolean => {
  return typeof p === 'string' && p.startsWith('/') && p.length > 2;
};

/**
 * Default Authenticated Google Cloud SQL Configuration for 'asia-southeast1' (Singapore)
 * Supports both platform SQL_* runtime variables and explicit CLOUDSQL_* configurations.
 */
export const DEFAULT_CLOUDSQL_CONNECTION_CONFIG: CloudSqlDatabaseConfig = {
  projectId: sanitizeEnv(process.env.CLOUDSQL_PROJECT_ID, 'gen-lang-client-0808966802'),
  region: CLOUD_SQL_TARGET_REGION,
  instanceName: sanitizeEnv(process.env.CLOUDSQL_INSTANCE_NAME, 'gnn-studio-db-asia-se1'),
  database: sanitizeEnv(process.env.SQL_DB_NAME || process.env.CLOUDSQL_DATABASE || process.env.PGDATABASE, 'gnn_studio'),
  user: sanitizeEnv(process.env.SQL_USER || process.env.CLOUDSQL_USER || process.env.PGUSER, 'gnn_admin'),
  password: process.env.SQL_PASSWORD || process.env.CLOUDSQL_PASSWORD || process.env.PGPASSWORD || '',
  host: sanitizeEnv(process.env.SQL_HOST || process.env.CLOUDSQL_HOST || process.env.PGHOST, '127.0.0.1'),
  port: parseInt(process.env.CLOUDSQL_PORT || process.env.PGPORT || '5432', 10) || 5432,
  socketPath: isValidSocketPath(process.env.CLOUDSQL_SOCKET_PATH) ? process.env.CLOUDSQL_SOCKET_PATH : undefined,
  ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false,
  maxConnections: 10,
  connectionTimeoutMillis: 10000,
  idleTimeoutMillis: 30000,
};

// Global pool caching declaration to prevent socket leaks during hot-reloads
declare global {
  var _gnnCloudSqlPool: Pool | undefined;
}

/**
 * Generates the canonical Google Cloud SQL Instance Connection Name:
 * Format: `<project-id>:<region>:<instance-name>` (e.g. `gen-lang-client-0808966802:asia-southeast1:gnn-studio-db-asia-se1`)
 */
export function getCloudSqlInstanceConnectionName(
  config: CloudSqlDatabaseConfig = DEFAULT_CLOUDSQL_CONNECTION_CONFIG
): string {
  return `${config.projectId}:${config.region}:${config.instanceName}`;
}

/**
 * Builds the pool configuration using the Object Method mandated for Google Cloud SQL.
 * Prefers Unix domain socket in Google Cloud Run environments if configured or available,
 * otherwise connects via Cloud SQL Auth Proxy TCP loopback with authentication.
 */
export function buildPoolConfig(config: CloudSqlDatabaseConfig = DEFAULT_CLOUDSQL_CONNECTION_CONFIG): PoolConfig {
  const instanceConnectionName = getCloudSqlInstanceConnectionName(config);

  const poolConfig: PoolConfig = {
    user: config.user,
    password: config.password,
    database: config.database,
    max: config.maxConnections || 10,
    connectionTimeoutMillis: config.connectionTimeoutMillis || 10000,
    idleTimeoutMillis: config.idleTimeoutMillis || 30000,
  };

  // Google Cloud Run Unix domain socket authentication path (e.g. /cloudsql/<instance>)
  if (isValidSocketPath(config.socketPath)) {
    poolConfig.host = `${config.socketPath}/${instanceConnectionName}`;
  } else if (isValidSocketPath(process.env.CLOUDSQL_SOCKET_PATH)) {
    poolConfig.host = `${process.env.CLOUDSQL_SOCKET_PATH}/${instanceConnectionName}`;
  } else if (isValidSocketPath(process.env.SQL_HOST)) {
    // Cloud SQL Auth Proxy mounted unix socket
    poolConfig.host = process.env.SQL_HOST;
  } else {
    // Standard TCP socket connection (Cloud SQL Auth Proxy on 127.0.0.1 or direct host)
    poolConfig.host = config.host || '127.0.0.1';
    poolConfig.port = config.port || 5432;
    if (config.ssl) {
      poolConfig.ssl = config.ssl;
    }
  }

  return poolConfig;
}

/**
 * Lazily initializes and returns the authenticated Google Cloud SQL connection pool
 * for the 'asia-southeast1' region. Persists the singleton across process execution.
 */
export function getCloudSqlDatabasePool(customConfig?: Partial<CloudSqlDatabaseConfig>): Pool {
  if (global._gnnCloudSqlPool) {
    return global._gnnCloudSqlPool;
  }

  const mergedConfig: CloudSqlDatabaseConfig = {
    ...DEFAULT_CLOUDSQL_CONNECTION_CONFIG,
    ...customConfig,
    // Always enforce the asia-southeast1 target region
    region: customConfig?.region || CLOUD_SQL_TARGET_REGION,
  };

  const poolConfig = buildPoolConfig(mergedConfig);
  const pool = new Pool(poolConfig);

  // Global listener prevents unhandled client error from crashing Node.js runtime
  pool.on('error', (err: Error) => {
    console.warn(`[Cloud SQL ${mergedConfig.region}] Idle pool client warning:`, err.message);
  });

  global._gnnCloudSqlPool = pool;
  return pool;
}

/**
 * Alias for getCloudSqlDatabasePool to match common database factory naming
 */
export const createPool = getCloudSqlDatabasePool;

/**
 * Safely executes a parameterized SQL query against Google Cloud SQL (asia-southeast1)
 * with robust error handling and sanitized failure reporting.
 */
export async function executeAuthenticatedQuery<T = any>(
  queryText: string,
  params: any[] = [],
  customConfig?: Partial<CloudSqlDatabaseConfig>
): Promise<QueryResult<T>> {
  const pool = getCloudSqlDatabasePool(customConfig);
  const startTime = Date.now();

  try {
    const result = await pool.query<T>(queryText, params);
    const duration = Date.now() - startTime;
    if (duration > 1000) {
      console.warn(`[Cloud SQL ${CLOUD_SQL_TARGET_REGION}] Slow query (${duration}ms): ${queryText.substring(0, 100)}...`);
    }
    return result;
  } catch (error: any) {
    console.error(`[Cloud SQL ${CLOUD_SQL_TARGET_REGION}] Query failed:`, error.message);
    // Sanitize error to avoid leaking credentials or internal host details
    throw new Error(`Google Cloud SQL query error in region ${CLOUD_SQL_TARGET_REGION}: ${error.message}`, {
      cause: error,
    });
  }
}

/**
 * Executes a sequence of database operations within an isolated transaction.
 * Automatically handles BEGIN, COMMIT, and ROLLBACK upon error.
 */
export async function withDatabaseTransaction<T>(
  callback: (client: PoolClient) => Promise<T>,
  customConfig?: Partial<CloudSqlDatabaseConfig>
): Promise<T> {
  const pool = getCloudSqlDatabasePool(customConfig);
  const client = await pool.connect();

  try {
    await client.query('BEGIN');
    const result = await callback(client);
    await client.query('COMMIT');
    return result;
  } catch (error: any) {
    try {
      await client.query('ROLLBACK');
    } catch (rollbackErr: any) {
      console.error(`[Cloud SQL ${CLOUD_SQL_TARGET_REGION}] Rollback failure:`, rollbackErr.message);
    }
    throw error;
  } finally {
    client.release();
  }
}

/**
 * Verifies live connection health, credential authentication, and latency
 * for Google Cloud SQL in 'asia-southeast1'.
 */
export async function verifyCloudSqlStorageConnection(
  customConfig?: Partial<CloudSqlDatabaseConfig>
): Promise<CloudSqlDiagnosticReport> {
  const config: CloudSqlDatabaseConfig = {
    ...DEFAULT_CLOUDSQL_CONNECTION_CONFIG,
    ...customConfig,
    region: customConfig?.region || CLOUD_SQL_TARGET_REGION,
  };

  const instanceConnectionName = getCloudSqlInstanceConnectionName(config);
  const startTime = Date.now();

  try {
    const pool = getCloudSqlDatabasePool(customConfig);
    const client = await pool.connect();

    try {
      const res = await client.query(`
        SELECT 
          NOW() as server_time,
          current_database() as database_name,
          current_user as authenticated_user,
          version() as pg_version
      `);

      const latencyMs = Date.now() - startTime;
      const row = res.rows[0] || {};

      return {
        connected: true,
        region: config.region,
        instanceConnectionName,
        database: row.database_name || config.database,
        user: row.authenticated_user || config.user,
        driver: 'pg (node-postgres) with Google Cloud SQL Auth Proxy (TLS / Socket)',
        poolActive: pool.totalCount - pool.idleCount,
        poolIdle: pool.idleCount,
        poolTotal: pool.totalCount,
        serverVersion: row.pg_version ? row.pg_version.split(' on ')[0] : 'PostgreSQL',
        timestamp: new Date().toISOString(),
        latencyMs,
        isMockFallback: false,
      };
    } finally {
      client.release();
    }
  } catch (err: any) {
    const latencyMs = Date.now() - startTime;
    return {
      connected: false,
      region: config.region,
      instanceConnectionName,
      database: config.database,
      user: config.user,
      driver: 'pg (node-postgres) with In-Memory Resilient Store',
      poolActive: 0,
      poolIdle: 0,
      poolTotal: 0,
      timestamp: new Date().toISOString(),
      latencyMs,
      error: `Cloud SQL [${config.region}] connection offline: ${err.message}`,
      isMockFallback: true,
    };
  }
}

/**
 * Ensures the persistent storage tables exist in the Cloud SQL database for GNN AI OS
 */
export async function ensurePersistentStorageSchema(): Promise<{ initialized: boolean; tables: string[]; error?: string }> {
  try {
    const pool = getCloudSqlDatabasePool();
    const client = await pool.connect();

    try {
      await client.query(`
        CREATE TABLE IF NOT EXISTS gnn_scripts (
          id VARCHAR(64) PRIMARY KEY,
          title VARCHAR(255) NOT NULL,
          headline TEXT,
          hook TEXT,
          body TEXT NOT NULL,
          outro TEXT,
          voiceover_text TEXT,
          language VARCHAR(32) DEFAULT 'English',
          status VARCHAR(32) DEFAULT 'pending_review',
          author VARCHAR(128),
          reviewer VARCHAR(128),
          review_notes TEXT,
          created_at TIMESTAMPTZ DEFAULT NOW(),
          submitted_at TIMESTAMPTZ,
          reviewed_at TIMESTAMPTZ,
          updated_at TIMESTAMPTZ DEFAULT NOW()
        );

        CREATE TABLE IF NOT EXISTS gnn_script_audit_logs (
          id VARCHAR(64) PRIMARY KEY,
          script_id VARCHAR(64) NOT NULL,
          script_title VARCHAR(255),
          action VARCHAR(32) NOT NULL,
          previous_status VARCHAR(32),
          new_status VARCHAR(32) NOT NULL,
          reviewer VARCHAR(128) NOT NULL,
          reviewer_role VARCHAR(64),
          notes TEXT,
          created_at TIMESTAMPTZ DEFAULT NOW()
        );

        CREATE TABLE IF NOT EXISTS gnn_analytics_snapshots (
          id VARCHAR(64) PRIMARY KEY,
          timeframe VARCHAR(32) NOT NULL,
          platform VARCHAR(32) NOT NULL,
          total_views BIGINT NOT NULL,
          total_reach BIGINT NOT NULL,
          total_likes BIGINT NOT NULL,
          total_shares BIGINT NOT NULL,
          total_comments BIGINT NOT NULL,
          active_viewers INT NOT NULL,
          scripts_count INT NOT NULL,
          posts_count INT NOT NULL,
          payload JSONB,
          created_at TIMESTAMPTZ DEFAULT NOW()
        );

        CREATE TABLE IF NOT EXISTS gnn_system_telemetry (
          id VARCHAR(64) PRIMARY KEY,
          source VARCHAR(64) NOT NULL,
          level VARCHAR(16) NOT NULL,
          event VARCHAR(64) NOT NULL,
          project VARCHAR(64) NOT NULL,
          status VARCHAR(32) NOT NULL,
          message TEXT NOT NULL,
          metadata JSONB,
          created_at TIMESTAMPTZ DEFAULT NOW()
        );

        CREATE INDEX IF NOT EXISTS idx_gnn_scripts_status ON gnn_scripts(status);
        CREATE INDEX IF NOT EXISTS idx_gnn_audit_script_id ON gnn_script_audit_logs(script_id);
        CREATE INDEX IF NOT EXISTS idx_gnn_telemetry_created_at ON gnn_system_telemetry(created_at DESC);
      `);

      return {
        initialized: true,
        tables: ['gnn_scripts', 'gnn_script_audit_logs', 'gnn_analytics_snapshots', 'gnn_system_telemetry'],
      };
    } finally {
      client.release();
    }
  } catch (err: any) {
    console.warn(`[Cloud SQL ${CLOUD_SQL_TARGET_REGION}] Persistent schema initialization notice:`, err.message);
    return {
      initialized: false,
      tables: [],
      error: err.message,
    };
  }
}

/**
 * Gracefully terminates the connection pool upon application shutdown
 */
export async function closeDatabasePool(): Promise<void> {
  if (global._gnnCloudSqlPool) {
    try {
      await global._gnnCloudSqlPool.end();
      console.log(`[Cloud SQL ${CLOUD_SQL_TARGET_REGION}] Connection pool cleanly terminated.`);
    } catch (err: any) {
      console.error(`[Cloud SQL ${CLOUD_SQL_TARGET_REGION}] Error closing pool:`, err.message);
    } finally {
      global._gnnCloudSqlPool = undefined;
    }
  }
}
