import admin from 'firebase-admin';
import jwt from 'jsonwebtoken';
import { User } from '../models/index.js';
import logger from '../utils/logger.js';

function adminJwtSecret() {
  if (process.env.ADMIN_JWT_SECRET || process.env.JWT_SECRET) {
    return process.env.ADMIN_JWT_SECRET || process.env.JWT_SECRET;
  }
  return process.env.NODE_ENV === 'production'
    ? ''
    : 'dev-admin-jwt-secret-change-me';
}

// Initialize Firebase Admin using project ID from config or env
if (!admin.apps.length) {
  const projectId = process.env.FIREBASE_PROJECT_ID || 'onestep-hub-66f66';
  try {
    // Try with application default credentials first
    admin.initializeApp({
      credential: admin.credential.applicationDefault(),
      projectId,
    });
    logger.info(`Firebase Admin initialized with credentials (project: ${projectId})`);
  } catch {
    // Fall back to project ID only (sufficient for verifyIdToken)
    admin.initializeApp({ projectId });
    logger.info(`Firebase Admin initialized (project: ${projectId})`);
  }
}

// Import admin tokens from auth route (lazy load to avoid circular deps)
let adminTokensRef = null;
async function getAdminTokens() {
  if (!adminTokensRef) {
    const mod = await import('../routes/auth.js');
    adminTokensRef = mod.adminTokens;
  }
  return adminTokensRef;
}

// Helper: check if a string looks like a JWT (3 dot-separated base64 parts)
function isJWT(token) {
  const parts = token.split('.');
  return parts.length === 3 && parts.every(p => p.length > 0);
}

export const authenticate = async (req, res, next) => {
  const header = req.headers.authorization;
  if (!header?.startsWith('Bearer ')) {
    res.status(401).json({ error: 'Authentication required' });
    return;
  }
  try {
    const token = header.split('Bearer ')[1];
    
    // Optional dev bypass, enabled only when explicitly requested.
    if (process.env.ENABLE_DEBUG_AUTH_BYPASS === 'true' && token === 'onestep-debug-user-token') {
      req.user = { uid: 'testuser_123', email: 'test@onestep.com', role: 'user' };
      // Ensure test user exists in DB
      try {
        await User.findOrCreate({
          where: { uid: 'testuser_123' },
          defaults: { uid: 'testuser_123', email: 'test@onestep.com', displayName: 'Test User' }
        });
      } catch (e) { logger.warn(`Mock user sync failed: ${e.message}`); }
      next();
      return;
    }

    // Admin JWT (signed server-side; survives restarts)
    const secret = adminJwtSecret();
    if (secret) {
      try {
        const decoded = jwt.verify(token, secret);
        if (decoded.typ === 'admin_session' && decoded.role === 'admin') {
          req.user = { uid: decoded.uid, email: decoded.email, role: 'admin' };
          next();
          return;
        }
      } catch { /* not our admin JWT */ }
    } else if (process.env.NODE_ENV === 'production') {
      logger.warn('Admin JWT secret missing in production');
    }

    // Legacy in-memory admin session token
    const adminTokens = await getAdminTokens();
    const adminSession = adminTokens?.get(token);
    if (adminSession) {
      req.user = { uid: adminSession.uid, email: adminSession.email, role: 'admin' };
      next();
      return;
    }

    // Only try Firebase verification if token looks like a JWT
    if (!isJWT(token)) {
      // This is likely a stale admin session token — tell client to re-authenticate
      res.status(401).json({ error: 'Session expired. Please log in again.' });
      return;
    }

    // Verify Firebase ID token
    const decoded = await admin.auth().verifyIdToken(token);
    req.user = { uid: decoded.uid, email: decoded.email || '' };
    // Try to fetch role from DB, but don't fail if DB is down
    try {
      const dbUser = await User.findByPk(decoded.uid);
      if (dbUser) req.user.role = dbUser.role;
    } catch { /* DB lookup failed — proceed without role */ }
    next();
  } catch (err) {
    logger.warn(`Auth error: ${err.message}`);
    res.status(401).json({ error: 'Invalid or expired token' });
  }
};

export const optionalAuth = async (req, _res, next) => {
  const header = req.headers.authorization;
  if (!header?.startsWith('Bearer ')) { next(); return; }
  try {
    const token = header.split('Bearer ')[1];

    const secret = adminJwtSecret();
    if (secret) {
      try {
        const decoded = jwt.verify(token, secret);
        if (decoded.typ === 'admin_session' && decoded.role === 'admin') {
          req.user = { uid: decoded.uid, email: decoded.email, role: 'admin' };
          next();
          return;
        }
      } catch { /* */ }
    }

    const adminTokens = await getAdminTokens();
    const adminSession = adminTokens?.get(token);
    if (adminSession) {
      req.user = { uid: adminSession.uid, email: adminSession.email, role: 'admin' };
      next();
      return;
    }

    if (!isJWT(token)) { next(); return; }

    const decoded = await admin.auth().verifyIdToken(token);
    req.user = { uid: decoded.uid, email: decoded.email || '' };
    try {
      const dbUser = await User.findByPk(decoded.uid);
      if (dbUser) req.user.role = dbUser.role;
    } catch { /* DB lookup failed */ }
  } catch { /* token invalid — proceed as anonymous */ }
  next();
};

export const requireAdmin = (req, res, next) => {
  if (req.user?.role !== 'admin') {
    res.status(403).json({ error: 'Admin access required' });
    return;
  }
  next();
};

export const requireSeller = (req, res, next) => {
  if (req.user?.role === 'admin' || req.user?.role === 'seller') {
    next();
    return;
  }
  res.status(403).json({ error: 'Seller access required' });
};
