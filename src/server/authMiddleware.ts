import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';

export interface GnnUserPayload {
  id: string;
  login: string;
  name: string;
  email?: string;
  role: 'OWNER' | 'ADMIN' | 'DEVELOPER' | 'EDITOR' | 'ANCHOR' | 'USER' | 'VIEWER' | 'SYSTEM';
  scopes: string[];
  avatarUrl?: string;
  stationId?: string;
  iat?: number;
  exp?: number;
}

export interface AuthenticatedRequest extends Request {
  user?: GnnUserPayload;
  token?: string;
  authScopes?: string[];
}

export const GNN_JWT_SECRET = process.env.JWT_SECRET || 'gnn_studio_secure_jwt_secret_9981';

/**
 * Default standard permission scopes for GNN AI OS roles
 */
export const ROLE_DEFAULT_SCOPES: Record<string, string[]> = {
  OWNER: ['*'],
  ADMIN: [
    'scripts:read',
    'scripts:write',
    'scripts:approve',
    'scripts:reject',
    'scripts:delete',
    'social:read',
    'social:schedule',
    'social:publish',
    'cloudsql:read',
    'cloudsql:write',
    'cloudsql:admin',
    'analytics:read',
    'analytics:export',
    'system:configure',
    'ai:generate',
    'mcp:execute',
    'github.read',
    'github.write',
    'github.deploy',
    'drive.read',
    'drive.write',
    'database.read',
    'database.write',
    'social.draft',
    'social.publish',
    'cloud.read',
    'cloud.scale'
  ],
  DEVELOPER: [
    'github.read',
    'github.write',
    'github.deploy',
    'cloud.read',
    'cloud.scale',
    'database.read',
    'database.write',
    'drive.read',
    'scripts:read',
    'scripts:write',
    'mcp:execute',
    'ai:generate'
  ],
  EDITOR: [
    'scripts:read',
    'scripts:write',
    'scripts:review_submit',
    'social:read',
    'social:schedule',
    'social.draft',
    'github.read',
    'drive.read',
    'cloudsql:read',
    'database.read',
    'analytics:read',
    'analytics:export',
    'ai:generate'
  ],
  ANCHOR: [
    'scripts:read',
    'scripts:review_submit',
    'social:read',
    'drive.read',
    'analytics:read',
    'ai:generate'
  ],
  USER: [
    'scripts:read',
    'social:read',
    'analytics:read'
  ],
  VIEWER: [
    'scripts:read',
    'social:read',
    'analytics:read'
  ],
  SYSTEM: ['*']
};

/**
 * Generate a signed JWT token for a GNN AI OS identity
 */
export function createGnnToken(
  user: Partial<GnnUserPayload> & { id: string; login: string; role: GnnUserPayload['role'] },
  expiresIn: string = '7d'
): string {
  const scopes = user.scopes && user.scopes.length > 0
    ? user.scopes
    : ROLE_DEFAULT_SCOPES[user.role] || ROLE_DEFAULT_SCOPES.VIEWER;

  const payload: GnnUserPayload = {
    id: user.id,
    login: user.login,
    name: user.name || user.login,
    email: user.email,
    role: user.role,
    scopes,
    avatarUrl: user.avatarUrl,
    stationId: user.stationId || 'gnn-station-dhaka-global-01',
  };

  return jwt.sign(payload, GNN_JWT_SECRET, { expiresIn } as any);
}

/**
 * Verify and decode a JWT token string
 */
export function verifyGnnJwtToken(token: string): { valid: boolean; payload?: GnnUserPayload; error?: string } {
  try {
    const decoded = jwt.verify(token, GNN_JWT_SECRET) as GnnUserPayload;
    return { valid: true, payload: decoded };
  } catch (err: any) {
    return { valid: false, error: err.message || 'Invalid or expired JWT token' };
  }
}

/**
 * Extract bearer token from standard Authorization header, x-gnn-auth-token, or query params
 */
export function extractTokenFromRequest(req: Request): string | null {
  const authHeader = req.headers.authorization;
  if (authHeader && authHeader.startsWith('Bearer ')) {
    return authHeader.substring(7).trim();
  }

  const customHeader = req.headers['x-gnn-auth-token'];
  if (typeof customHeader === 'string' && customHeader.trim()) {
    return customHeader.trim();
  }

  if (typeof req.query.token === 'string' && req.query.token.trim()) {
    return req.query.token.trim();
  }

  return null;
}

/**
 * Express Middleware: Require valid JWT token before proceeding
 */
export function requireGnnAuth(req: AuthenticatedRequest, res: Response, next: NextFunction) {
  const token = extractTokenFromRequest(req);

  if (!token) {
    // If running in development/preview without token provided, fallback to demo authorized identity
    if (process.env.NODE_ENV !== 'production' && req.headers['x-allow-dev-fallback'] === 'true') {
      req.user = {
        id: 'dev-owner-01',
        login: 'GNN-Dev-Director',
        name: 'GNN Station Director (Dev Fallback)',
        role: 'OWNER',
        scopes: ['*'],
        stationId: 'gnn-station-dhaka-01'
      };
      req.authScopes = ['*'];
      return next();
    }

    return res.status(401).json({
      success: false,
      code: 'AUTH_REQUIRED',
      error: 'Unauthorized: Missing JWT authorization token in request headers (Authorization: Bearer <token>)'
    });
  }

  const result = verifyGnnJwtToken(token);
  if (!result.valid || !result.payload) {
    return res.status(401).json({
      success: false,
      code: 'INVALID_TOKEN',
      error: `Unauthorized: ${result.error || 'Invalid or expired JWT token'}`
    });
  }

  req.user = result.payload;
  req.token = token;
  req.authScopes = result.payload.scopes || [];
  next();
}

/**
 * Express Middleware: Validate user has at least one of the required permission scopes
 */
export function requirePermissionScope(requiredScope: string | string[]) {
  const requiredList = Array.isArray(requiredScope) ? requiredScope : [requiredScope];

  return (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        code: 'UNAUTHENTICATED',
        error: 'Unauthorized: Session authentication is required prior to scope validation'
      });
    }

    const userScopes = req.user.scopes || [];
    const userRole = req.user.role || 'VIEWER';

    // Super user wildcard check
    const hasWildcard = userScopes.includes('*') || userRole === 'OWNER';
    if (hasWildcard) {
      return next();
    }

    // Check if at least one required scope is granted
    const hasPermission = requiredList.some(reqScope => {
      if (userScopes.includes(reqScope)) return true;
      // Handle prefix wildcards (e.g. 'scripts:*' grants 'scripts:approve', 'cloud.*' grants 'cloud.scale')
      const colonPrefix = reqScope.includes(':') ? reqScope.split(':')[0] + ':*' : null;
      const dotPrefix = reqScope.includes('.') ? reqScope.split('.')[0] + '.*' : null;
      const crossColonPrefix = reqScope.includes('.') ? reqScope.split('.')[0] + ':*' : null;
      const crossDotPrefix = reqScope.includes(':') ? reqScope.split(':')[0] + '.*' : null;

      if (colonPrefix && userScopes.includes(colonPrefix)) return true;
      if (dotPrefix && userScopes.includes(dotPrefix)) return true;
      if (crossColonPrefix && userScopes.includes(crossColonPrefix)) return true;
      if (crossDotPrefix && userScopes.includes(crossDotPrefix)) return true;

      return false;
    });

    if (hasPermission) {
      return next();
    }

    return res.status(403).json({
      success: false,
      code: 'INSUFFICIENT_PERMISSIONS',
      error: `Forbidden: Action requires scope [${requiredList.join(' OR ')}]. Current role [${userRole}] has scopes: [${userScopes.join(', ')}]`,
      requiredScopes: requiredList,
      grantedScopes: userScopes,
      userRole
    });
  };
}

/**
 * High-order function wrapper for wrapping sensitive GNN AI OS actions with scope validation
 */
export function withGnnSecurityScope(
  scope: string | string[],
  handler: (req: AuthenticatedRequest, res: Response) => Promise<any> | any
) {
  return [
    requireGnnAuth,
    requirePermissionScope(scope),
    async (req: AuthenticatedRequest, res: Response) => {
      try {
        await handler(req, res);
      } catch (err: any) {
        console.error(`Error in security-scoped handler [${Array.isArray(scope) ? scope.join(',') : scope}]:`, err);
        res.status(500).json({
          success: false,
          error: `Internal handler error: ${err.message || 'Operation failed'}`
        });
      }
    }
  ];
}
