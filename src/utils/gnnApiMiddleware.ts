/**
 * GNN AI OS - Client-Side API Middleware Wrapper
 * 
 * Validates JWT tokens from localStorage and validates user permission scopes
 * (e.g., 'github.read', 'cloud.scale', etc.) prior to executing sensitive OS actions.
 */

export const GNN_LOCAL_STORAGE_TOKEN_KEY = 'gnn_jwt_token';

export interface GnnTokenPayload {
  id: string;
  login: string;
  name: string;
  email?: string;
  role: 'OWNER' | 'ADMIN' | 'DEVELOPER' | 'EDITOR' | 'ANCHOR' | 'USER' | 'VIEWER' | 'SYSTEM' | string;
  scopes: string[];
  avatarUrl?: string;
  stationId?: string;
  iat?: number;
  exp?: number;
}

export interface ScopeVerificationResult {
  allowed: boolean;
  code?: 'AUTHORIZED' | 'MISSING_TOKEN' | 'TOKEN_EXPIRED' | 'INSUFFICIENT_PERMISSIONS' | 'INVALID_TOKEN_FORMAT';
  error?: string;
  requiredScopes: string[];
  grantedScopes: string[];
  payload?: GnnTokenPayload | null;
  token?: string | null;
}

export interface GnnActionResult<T = any> {
  success: boolean;
  code: string;
  message?: string;
  error?: string;
  action: string;
  requiredScopes: string[];
  grantedScopes: string[];
  timestamp: string;
  data?: T;
  executedBy?: string;
  source?: string;
  auditId?: string;
}

/**
 * Predefined catalog of sensitive GNN AI OS actions with required scopes
 */
export interface SensitiveActionConfig {
  id: string;
  name: string;
  description: string;
  category: 'Cloud Infrastructure' | 'Developer & Git' | 'Database' | 'Broadcast' | 'Social Gateway';
  requiredScopes: string[];
  riskLevel: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  defaultPayload?: any;
}

export const SENSITIVE_GNN_ACTIONS: Record<string, SensitiveActionConfig> = {
  'github.read_repo': {
    id: 'github.read_repo',
    name: 'GitHub Repository Clone & Branch Audit',
    description: 'Clone private repository code, inspect branch tree and pull recent commit SHAs',
    category: 'Developer & Git',
    requiredScopes: ['github.read'],
    riskLevel: 'LOW',
    defaultPayload: { repository: 'gnn-station/ai-studio-core', branch: 'origin/main' }
  },
  'github.commit_push': {
    id: 'github.commit_push',
    name: 'GitHub Automated Commit & Remote Push',
    description: 'Commit studio script templates and trigger remote branch push via SSH',
    category: 'Developer & Git',
    requiredScopes: ['github.write'],
    riskLevel: 'HIGH',
    defaultPayload: { message: 'feat: update news anchor cue templates', filesChanged: 4 }
  },
  'cloud.scale_cluster': {
    id: 'cloud.scale_cluster',
    name: 'Google Cloud Run Dynamic Cluster Scaler',
    description: 'Scale active worker node count from 2 to 16 instances for high-throughput video rendering',
    category: 'Cloud Infrastructure',
    requiredScopes: ['cloud.scale'],
    riskLevel: 'HIGH',
    defaultPayload: { targetInstances: 16, minInstances: 2, region: 'asia-southeast1', autoDrainTimeoutSec: 60 }
  },
  'cloud.container_restart': {
    id: 'cloud.container_restart',
    name: 'Production FFmpeg Container Pool Restart',
    description: 'Gracefully recycle video transcoding workers and reinitialize audio buffer pools',
    category: 'Cloud Infrastructure',
    requiredScopes: ['cloud.scale'],
    riskLevel: 'CRITICAL',
    defaultPayload: { workerPool: 'ffmpeg-transcode-pool-asia', forceKill: false }
  },
  'database.migrate_schema': {
    id: 'database.migrate_schema',
    name: 'Cloud SQL Partition Maintenance & Schema Sync',
    description: 'Run DDL schema synchronization and re-index high-density telemetry partitions',
    category: 'Database',
    requiredScopes: ['database.write'],
    riskLevel: 'HIGH',
    defaultPayload: { targetPartition: 'telemetry_metrics_2026_q3', reindexMode: 'CONCURRENTLY' }
  },
  'database.export_snapshot': {
    id: 'database.export_snapshot',
    name: 'Database Cold Backup Snapshot Export',
    description: 'Dump PostgreSQL telemetry tables to Google Cloud Storage archival bucket',
    category: 'Database',
    requiredScopes: ['database.read'],
    riskLevel: 'MEDIUM',
    defaultPayload: { destinationBucket: 'gs://gnn-cold-archive-asia/db-snapshots' }
  },
  'social.emergency_blast': {
    id: 'social.emergency_blast',
    name: 'Ocoya Social Gateway Synchronous Publish',
    description: 'Push breaking bulletin posts simultaneously across TikTok, YouTube, and Instagram',
    category: 'Social Gateway',
    requiredScopes: ['social.publish'],
    riskLevel: 'HIGH',
    defaultPayload: { platforms: ['youtube', 'tiktok', 'instagram'], priority: 'IMMEDIATE' }
  },
  'studio.emergency_broadcast_override': {
    id: 'studio.emergency_broadcast_override',
    name: 'Station Master Broadcast Stream Interruption',
    description: 'Interrupt live scheduled rotation with verified high-priority breaking news banner',
    category: 'Broadcast',
    requiredScopes: ['system:configure'],
    riskLevel: 'CRITICAL',
    defaultPayload: { channel: 'GNN-LIVE-HD1', alertLevel: 'FLASH_CRITICAL' }
  }
};

/**
 * Retrieve raw token from localStorage
 */
export function getStoredJwtToken(): string | null {
  if (typeof window === 'undefined' || !window.localStorage) {
    return null;
  }
  return localStorage.getItem(GNN_LOCAL_STORAGE_TOKEN_KEY);
}

/**
 * Store JWT token in localStorage
 */
export function storeJwtToken(token: string): void {
  if (typeof window !== 'undefined' && window.localStorage) {
    localStorage.setItem(GNN_LOCAL_STORAGE_TOKEN_KEY, token);
  }
}

/**
 * Clear JWT token from localStorage
 */
export function removeStoredJwtToken(): void {
  if (typeof window !== 'undefined' && window.localStorage) {
    localStorage.removeItem(GNN_LOCAL_STORAGE_TOKEN_KEY);
  }
}

/**
 * Decode JWT token payload without external libraries
 */
export function decodeJwtPayload(token: string): GnnTokenPayload | null {
  try {
    const parts = token.split('.');
    if (parts.length !== 3) {
      return null;
    }
    // Base64URL decode
    const base64Url = parts[1];
    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    const jsonPayload = decodeURIComponent(
      atob(base64)
        .split('')
        .map(c => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
        .join('')
    );
    return JSON.parse(jsonPayload);
  } catch (e) {
    console.warn('[GNN JWT Middleware] Failed to parse JWT token base64 payload:', e);
    return null;
  }
}

/**
 * Validate JWT token from localStorage (format, structure, expiration)
 */
export function validateLocalStorageToken(): {
  valid: boolean;
  token: string | null;
  payload: GnnTokenPayload | null;
  error?: string;
  expired?: boolean;
} {
  const token = getStoredJwtToken();
  if (!token) {
    return { valid: false, token: null, payload: null, error: 'No JWT token found in localStorage' };
  }

  const payload = decodeJwtPayload(token);
  if (!payload) {
    return { valid: false, token, payload: null, error: 'Invalid JWT token format or corrupted payload' };
  }

  // Check expiration if exp field is present (exp is in seconds)
  if (payload.exp && typeof payload.exp === 'number') {
    const nowSec = Math.floor(Date.now() / 1000);
    if (payload.exp < nowSec) {
      return { 
        valid: false, 
        token, 
        payload, 
        expired: true, 
        error: `JWT token has expired at ${new Date(payload.exp * 1000).toLocaleTimeString()}` 
      };
    }
  }

  return { valid: true, token, payload };
}

/**
 * Validate user permission scopes against a required scope or list of scopes
 * Evaluates exact match, superuser wildcard (*), and prefix wildcards (e.g., github.*, cloud.*, scripts:*)
 */
export function evaluatePermissionScopes(
  requiredScope: string | string[],
  userScopes: string[] = [],
  role?: string
): { allowed: boolean; reason?: string } {
  const requiredList = Array.isArray(requiredScope) ? requiredScope : [requiredScope];

  // Superuser or Owner role bypass
  if (role === 'OWNER' || userScopes.includes('*')) {
    return { allowed: true };
  }

  // Check if at least one required scope is satisfied
  const satisfied = requiredList.some(req => {
    // 1. Direct match
    if (userScopes.includes(req)) return true;

    // 2. Dot prefix wildcard (e.g. 'github.*' matches 'github.read')
    if (req.includes('.')) {
      const dotPrefix = req.split('.')[0] + '.*';
      if (userScopes.includes(dotPrefix)) return true;
      const colonPrefix = req.split('.')[0] + ':*';
      if (userScopes.includes(colonPrefix)) return true;
    }

    // 3. Colon prefix wildcard (e.g. 'scripts:*' matches 'scripts:approve')
    if (req.includes(':')) {
      const colonPrefix = req.split(':')[0] + ':*';
      if (userScopes.includes(colonPrefix)) return true;
      const dotPrefix = req.split(':')[0] + '.*';
      if (userScopes.includes(dotPrefix)) return true;
    }

    return false;
  });

  if (satisfied) {
    return { allowed: true };
  }

  return {
    allowed: false,
    reason: `Missing required permission scope: [${requiredList.join(' OR ')}]. Granted scopes: [${userScopes.length > 0 ? userScopes.join(', ') : 'NONE'}]`
  };
}

/**
 * Client-Side Middleware Guard:
 * Checks localStorage JWT token and verifies user permission scopes prior to execution
 */
export function verifyTokenAndScopes(requiredScope: string | string[]): ScopeVerificationResult {
  const requiredList = Array.isArray(requiredScope) ? requiredScope : [requiredScope];
  const { valid, token, payload, error, expired } = validateLocalStorageToken();

  if (!token) {
    return {
      allowed: false,
      code: 'MISSING_TOKEN',
      error: 'Unauthorized: Authentication token is missing from localStorage. Please log in or generate a token.',
      requiredScopes: requiredList,
      grantedScopes: [],
      token: null,
      payload: null
    };
  }

  if (!valid || !payload) {
    return {
      allowed: false,
      code: expired ? 'TOKEN_EXPIRED' : 'INVALID_TOKEN_FORMAT',
      error: error || 'Unauthorized: Invalid JWT token.',
      requiredScopes: requiredList,
      grantedScopes: [],
      token,
      payload
    };
  }

  const userScopes = payload.scopes || [];
  const evalResult = evaluatePermissionScopes(requiredList, userScopes, payload.role);

  if (!evalResult.allowed) {
    return {
      allowed: false,
      code: 'INSUFFICIENT_PERMISSIONS',
      error: evalResult.reason,
      requiredScopes: requiredList,
      grantedScopes: userScopes,
      token,
      payload
    };
  }

  return {
    allowed: true,
    code: 'AUTHORIZED',
    requiredScopes: requiredList,
    grantedScopes: userScopes,
    token,
    payload
  };
}

export interface ExecuteActionOptions {
  action: string;
  payload?: any;
  customScope?: string | string[];
  endpoint?: string;
  onBeforeExecute?: (config: SensitiveActionConfig | null, scopes: string[]) => void;
}

/**
 * API Middleware Wrapper:
 * Validates JWT token from localStorage and checks user permission scopes (e.g. github.read, cloud.scale)
 * before allowing execution of sensitive GNN AI OS actions.
 */
export async function executeGnnOsAction<T = any>(
  options: ExecuteActionOptions
): Promise<GnnActionResult<T>> {
  const { action, payload = {}, customScope, endpoint = '/api/gnn-os/execute-action', onBeforeExecute } = options;
  const config = SENSITIVE_GNN_ACTIONS[action] || null;

  // Determine required scopes from config or explicit customScope
  const requiredScopes = customScope 
    ? (Array.isArray(customScope) ? customScope : [customScope])
    : (config ? config.requiredScopes : [action]);

  // Step 1: Client-Side Security Middleware Gate (Validates localStorage token & scopes)
  const verification = verifyTokenAndScopes(requiredScopes);

  if (onBeforeExecute) {
    onBeforeExecute(config, verification.grantedScopes);
  }

  // If blocked on client-side, halt immediately without making an unauthorized network request
  if (!verification.allowed) {
    return {
      success: false,
      code: verification.code || 'BLOCKED_BY_MIDDLEWARE',
      error: verification.error || 'Execution blocked by GNN Security Middleware due to scope policy restriction.',
      action,
      requiredScopes,
      grantedScopes: verification.grantedScopes,
      timestamp: new Date().toISOString(),
      executedBy: verification.payload?.login || 'Anonymous'
    };
  }

  // Step 2: Attach JWT Bearer token into HTTP headers and execute API request
  try {
    const res = await fetch(endpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${verification.token}`,
        'x-gnn-auth-token': verification.token!
      },
      body: JSON.stringify({
        action,
        payload,
        requiredScopes,
        metadata: {
          clientTimestamp: new Date().toISOString(),
          stationId: verification.payload?.stationId || 'gnn-station-dhaka-global-01',
        }
      })
    });

    const data = await res.json();

    if (!res.ok || !data.success) {
      return {
        success: false,
        code: data.code || `HTTP_${res.status}`,
        error: data.error || `Server rejected action execution (${res.status})`,
        action,
        requiredScopes,
        grantedScopes: data.grantedScopes || verification.grantedScopes,
        timestamp: new Date().toISOString(),
        executedBy: verification.payload?.login || 'GNN-Operator',
        data: data
      };
    }

    return {
      success: true,
      code: 'EXECUTION_SUCCESS',
      message: data.message || `Action [${action}] successfully executed.`,
      action,
      requiredScopes,
      grantedScopes: data.grantedScopes || verification.grantedScopes,
      timestamp: data.timestamp || new Date().toISOString(),
      data: data.result || data,
      executedBy: data.executedBy || verification.payload?.login || 'GNN-Operator',
      auditId: data.auditId
    };
  } catch (err: any) {
    return {
      success: false,
      code: 'NETWORK_ERROR',
      error: `Network communication failure while executing action: ${err.message}`,
      action,
      requiredScopes,
      grantedScopes: verification.grantedScopes,
      timestamp: new Date().toISOString(),
      executedBy: verification.payload?.login || 'GNN-Operator'
    };
  }
}

/**
 * Generate a new signed JWT token with assigned scopes via the backend auth API
 * and store it directly into localStorage.
 */
export async function generateAndStoreGnnJwt(
  login: string = 'GNN-Operator',
  role: string = 'ADMIN',
  customScopes?: string[]
): Promise<{ token: string; payload: GnnTokenPayload }> {
  const res = await fetch('/api/auth/token', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      login,
      role,
      customScopes,
      expiresIn: '7d'
    })
  });

  const data = await res.json();
  if (!data.success || !data.token) {
    throw new Error(data.error || 'Failed to generate JWT token');
  }

  storeJwtToken(data.token);
  const payload = decodeJwtPayload(data.token);

  return {
    token: data.token,
    payload: payload || {
      id: 'gnn-user-fallback',
      login,
      name: login,
      role,
      scopes: customScopes || data.scopes || []
    }
  };
}
