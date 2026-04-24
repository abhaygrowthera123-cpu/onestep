import { Router } from 'express';
import admin from 'firebase-admin';
import { User } from '../models/index.js';

const router = Router();

/**
 * POST /api/setup/admin — Create or reset the default admin account.
 * Uses ADMIN_EMAIL and ADMIN_PASSWORD from .env
 * This is a one-time setup endpoint for development.
 */
router.post('/admin', async (_req, res) => {
  const email = process.env.ADMIN_EMAIL || 'admin@onestep.com';
  const password = process.env.ADMIN_PASSWORD || 'Admin@123';

  try {
    let firebaseUser;

    // Try to get existing Firebase user
    try {
      firebaseUser = await admin.auth().getUserByEmail(email);
      console.log(`✅ Admin Firebase user already exists: ${email}`);
    } catch (err) {
      // User doesn't exist — create it
      if (err.code === 'auth/user-not-found') {
        firebaseUser = await admin.auth().createUser({
          email,
          password,
          displayName: 'Admin',
          emailVerified: true,
        });
        console.log(`✅ Admin Firebase user created: ${email}`);
      } else {
        throw err;
      }
    }

    // Create or update admin user in MySQL
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

    // If user exists but isn't admin, promote them
    if (!created && dbUser.role !== 'admin') {
      await dbUser.update({ role: 'admin' });
    }

    res.json({
      success: true,
      message: `Admin account ready. Login with: ${email} / ${password}`,
      email,
      uid: firebaseUser.uid,
    });
  } catch (error) {
    console.error('❌ Admin setup failed:', error.message);
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
    res.json({
      adminExists: !!adminUser,
      adminEmail: adminUser?.email || null,
    });
  } catch {
    res.json({ adminExists: false, adminEmail: null });
  }
});

export default router;
