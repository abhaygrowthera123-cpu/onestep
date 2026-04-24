import { Router } from 'express';
import crypto from 'crypto';
import jwt from 'jsonwebtoken';
import { User } from '../models/index.js';
import logger from '../utils/logger.js';

const router = Router();

/** Legacy in-memory tokens (deprecated; JWT preferred) */
const adminTokens = new Map();

function adminJwtSecret() {
  if (process.env.ADMIN_JWT_SECRET || process.env.JWT_SECRET) {
    return process.env.ADMIN_JWT_SECRET || process.env.JWT_SECRET;
  }
  return process.env.NODE_ENV === 'production'
    ? ''
    : 'dev-admin-jwt-secret-change-me';
}

export function signAdminToken(uid, email) {
  return jwt.sign(
    { uid, email, role: 'admin', typ: 'admin_session' },
    adminJwtSecret(),
    { expiresIn: process.env.ADMIN_JWT_EXPIRES || '7d' }
  );
}

/**
 * POST /api/auth/admin-login
 */
router.post('/admin-login', async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ error: 'Email and password are required' });
  }

  const isProduction = process.env.NODE_ENV === 'production';
  const adminEmail = process.env.ADMIN_EMAIL;
  const adminPassword = process.env.ADMIN_PASSWORD;
  const jwtSecret = adminJwtSecret();

  if ((!adminEmail || !adminPassword || !jwtSecret) && isProduction) {
    return res.status(503).json({ error: 'Admin authentication is not configured' });
  }

  const resolvedEmail = adminEmail || 'admin@onestep.com';
  const resolvedPassword = adminPassword || 'Admin@123';

  if (email !== resolvedEmail || password !== resolvedPassword) {
    return res.status(401).json({ error: 'Invalid email or password' });
  }

  try {
    const uid = 'admin-' + crypto.createHash('md5').update(email).digest('hex').slice(0, 12);

    const [dbUser] = await User.findOrCreate({
      where: { uid },
      defaults: {
        uid,
        email,
        displayName: 'Admin',
        photoURL: '',
        role: 'admin',
      },
    });

    if (dbUser.role !== 'admin') {
      await dbUser.update({ role: 'admin' });
    }

    if (!jwtSecret) {
      return res.status(503).json({ error: 'Admin token secret is not configured' });
    }
    const token = signAdminToken(uid, email);

    logger.info('Admin logged in', { email });

    res.json({
      success: true,
      token,
      user: {
        uid,
        email,
        displayName: 'Admin',
        photoURL: '',
        role: 'admin',
        addresses: [],
        wishlist: [],
      },
    });
  } catch (error) {
    logger.error(`Admin login failed: ${error.message}`);
    res.status(500).json({ error: 'Login failed: ' + error.message });
  }
});

router.get('/verify', (req, res) => {
  const header = req.headers.authorization;
  if (!header?.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'No token provided' });
  }
  const raw = header.split('Bearer ')[1];
  try {
    const decoded = jwt.verify(raw, adminJwtSecret());
    if (decoded.typ === 'admin_session' && decoded.role === 'admin') {
      return res.json({
        valid: true,
        user: {
          uid: decoded.uid,
          email: decoded.email,
          role: 'admin',
        },
      });
    }
  } catch { /* fall through */ }
  const user = adminTokens.get(raw);
  if (!user) {
    return res.status(401).json({ error: 'Invalid token' });
  }
  res.json({ valid: true, user });
});

export { adminTokens };
export default router;
