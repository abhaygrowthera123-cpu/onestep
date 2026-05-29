import { Router } from 'express';
import admin from 'firebase-admin';
import { User } from '../models/index.js';

const router = Router();

function isProduction() {
  return process.env.NODE_ENV === 'production';
}

function verifySetupSecret(req) {
  const secret = process.env.SETUP_SECRET;
  if (!secret) return false;
  const header = req.headers['x-setup-secret'];
  return header === secret;
}

/**
 * POST /api/setup/admin — Create or reset the default admin account.
 * Production: requires X-Setup-Secret header matching SETUP_SECRET.
 */
router.post('/admin', async (req, res) => {
  if (isProduction() && !verifySetupSecret(req)) {
    return res.status(403).json({ error: 'Setup is disabled. Provide X-Setup-Secret header.' });
  }

  const email = process.env.ADMIN_EMAIL || (isProduction() ? null : 'admin@onestep.com');
  const password = process.env.ADMIN_PASSWORD || (isProduction() ? null : 'Admin@123');

  if (!email || !password) {
    return res.status(400).json({
      error: 'ADMIN_EMAIL and ADMIN_PASSWORD must be set in environment',
    });
  }

  try {
    let firebaseUser;

    try {
      firebaseUser = await admin.auth().getUserByEmail(email);
    } catch (err) {
      if (err.code === 'auth/user-not-found') {
        firebaseUser = await admin.auth().createUser({
          email,
          password,
          displayName: 'Admin',
          emailVerified: true,
        });
      } else {
        throw err;
      }
    }

    const [dbUser, created] = await User.findOrCreate({
      where: { uid: firebaseUser.uid },
      defaults: {
        uid: firebaseUser.uid,
        email,
        displayName: 'Admin',
        photoURL: '',
        role: 'admin',
        wishlist: [],
      },
    });

    if (!created && dbUser.role !== 'admin') {
      await dbUser.update({ role: 'admin' });
    }

    res.json({
      success: true,
      message: 'Admin account ready',
      email,
      uid: firebaseUser.uid,
    });
  } catch (error) {
    console.error('Admin setup failed:', error.message);
    res.status(500).json({
      error: 'Admin setup failed',
      details: error.message,
    });
  }
});

/**
 * GET /api/setup/status — Check if admin account exists
 */
router.get('/status', async (_req, res) => {
  try {
    const adminUser = await User.findOne({ where: { role: 'admin' } });
    if (isProduction()) {
      return res.json({ adminExists: !!adminUser });
    }
    res.json({
      adminExists: !!adminUser,
      adminEmail: adminUser?.email || null,
    });
  } catch {
    res.json({ adminExists: false, adminEmail: null });
  }
});

export default router;
