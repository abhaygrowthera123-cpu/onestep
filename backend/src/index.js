import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import dotenv from 'dotenv';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';

// Load env FIRST — before any other imports that might read env vars
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.resolve(__dirname, '../../.env') });

// Now import modules that depend on env vars
// Triggering restart to apply SYNC_ALTER change
import { sequelize } from './models/index.js';
import productRoutes from './routes/products.js';
import categoryRoutes from './routes/categories.js';
import orderRoutes from './routes/orders.js';
import userRoutes from './routes/users.js';
import contactRoutes from './routes/contact.js';
import { seedDatabase } from './seed.js';
import setupRoutes from './routes/setup.js';
import authRoutes from './routes/auth.js';
import uploadRoutes from './routes/upload.js';
import reviewRoutes from './routes/reviews.js';
import addressRoutes from './routes/addresses.js';
import checkoutRoutes from './routes/checkout.js';
import couponRoutes from './routes/coupons.js';
import settingsRoutes from './routes/settings.js';
import webhookRoutes from './routes/webhooks.js';
import walletRoutes from './routes/wallet.js';
import errorHandler from './middleware/errorHandler.js';
import { generalLimiter, authLimiter, uploadLimiter } from './middleware/rateLimiter.js';
import logger from './utils/logger.js';

const app = express();
const PORT = parseInt(process.env.PORT || process.env.BACKEND_PORT || '3001');
const frontendDistPath = path.resolve(__dirname, '../../frontend/dist');

// ── Security Middleware ────────────────────────────────────────
app.use(helmet({
  crossOriginResourcePolicy: { policy: 'cross-origin' }, // allow image loading from frontend
}));

app.use(cors({
  origin: process.env.ALLOWED_ORIGINS
    ? process.env.ALLOWED_ORIGINS.split(',')
    : [process.env.FRONTEND_URL || 'http://localhost:5173'],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Razorpay-Signature'],
}));

// ── Razorpay webhooks need raw body for signature verification ─
app.use('/api/v1/webhooks', express.raw({ type: 'application/json' }), webhookRoutes);
app.use('/api/webhooks', express.raw({ type: 'application/json' }), webhookRoutes);

// ── Body Parsing ───────────────────────────────────────────────
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// ── HTTP Request Logging (Morgan → Winston) ────────────────────
const morganStream = { write: (message) => logger.http(message.trim()) };
app.use(morgan(':method :url :status :res[content-length] - :response-time ms', {
  stream: morganStream,
  skip: (req) => req.path === '/api/health' || req.path === '/api/v1/health',
}));

// ── Health Check (MUST be before rate limiter) ─────────────────
app.get('/api/health', (_req, res) => {
  res.json({ status: 'ok', version: 'v1', timestamp: new Date().toISOString() });
});
app.get('/api/v1/health', (_req, res) => {
  res.json({ status: 'ok', version: 'v1', timestamp: new Date().toISOString() });
});

// ── Rate Limiting ──────────────────────────────────────────────
app.use('/api', (req, res, next) => {
  if (req.path === '/health' || req.path === '/v1/health') return next();
  generalLimiter(req, res, next);
});
app.use('/api/auth', authLimiter);
app.use('/api/v1/auth', authLimiter);
app.use('/api/upload', uploadLimiter);
app.use('/api/v1/upload', uploadLimiter);

// ── API v1 Routes ──────────────────────────────────────────────
app.use('/api/v1/products', productRoutes);
app.use('/api/v1/categories', categoryRoutes);
app.use('/api/v1/orders', orderRoutes);
app.use('/api/v1/users', userRoutes);
app.use('/api/v1/contact', contactRoutes);
app.use('/api/v1/setup', setupRoutes);
app.use('/api/v1/auth', authRoutes);
app.use('/api/v1/upload', uploadRoutes);
app.use('/api/v1/products', reviewRoutes);  // /products/:id/reviews
app.use('/api/v1/reviews', reviewRoutes);   // /reviews/:id (update/delete)
app.use('/api/v1/addresses', addressRoutes);
app.use('/api/v1/checkout', checkoutRoutes);
app.use('/api/v1/coupons', couponRoutes);
app.use('/api/v1/settings', settingsRoutes);
app.use('/api/v1/wallet', walletRoutes);

// ── Legacy Routes (backward compat — same handlers) ────────────
app.use('/api/products', productRoutes);
app.use('/api/categories', categoryRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/users', userRoutes);
app.use('/api/contact', contactRoutes);
app.use('/api/setup', setupRoutes);
app.use('/api/auth', authRoutes);
app.use('/api/upload', uploadRoutes);
app.use('/api/products', reviewRoutes);
app.use('/api/reviews', reviewRoutes);
app.use('/api/addresses', addressRoutes);
app.use('/api/checkout', checkoutRoutes);
app.use('/api/coupons', couponRoutes);
app.use('/api/settings', settingsRoutes);
app.use('/api/wallet', walletRoutes);

// ── Static Files ───────────────────────────────────────────────
app.use('/uploads', express.static(path.resolve(__dirname, '../uploads')));

// ── Frontend Static Hosting (production) ───────────────────────
if (process.env.SERVE_FRONTEND === 'true' || process.env.NODE_ENV === 'production') {
  if (fs.existsSync(frontendDistPath)) {
    app.use(express.static(frontendDistPath));
    app.get('*', (req, res, next) => {
      if (req.path.startsWith('/api') || req.path.startsWith('/uploads')) {
        next();
        return;
      }
      res.sendFile(path.join(frontendDistPath, 'index.html'));
    });
  } else {
    logger.warn(`Frontend dist not found at ${frontendDistPath}. Skipping static hosting.`);
  }
}

// ── 404 Handler ────────────────────────────────────────────────
app.use((_req, res) => {
  res.status(404).json({ error: 'Endpoint not found' });
});

// ── Global Error Handler (must be last) ────────────────────────
app.use(errorHandler);

// ── Start Server ───────────────────────────────────────────────
async function start() {
  const isProduction = process.env.NODE_ENV === 'production';

  // 1. Connect to database
  try {
    await sequelize.authenticate();
    logger.info(`Database connected (${sequelize.getDialect()})`);
  } catch (error) {
    logger.error(`Database connection failed: ${error.message}`);
    // Still start the server so health check can respond (helpful for debugging on Render)
  }

  // 2. Sync models
  try {
    const syncOptions = { alter: process.env.SYNC_ALTER === 'true' || false };
    for (let attempt = 1; attempt <= 3; attempt++) {
      try {
        await sequelize.sync(syncOptions);
        logger.info(`Models synced (alter: ${syncOptions.alter})`);
        break;
      } catch (syncErr) {
        if (attempt < 3 && (syncErr.message.includes('Deadlock') || syncErr.message.includes('Too many keys'))) {
          logger.warn(`Sync attempt ${attempt} failed: ${syncErr.message}. Retrying in 2s...`);
          await new Promise(r => setTimeout(r, 2000));
        } else {
          throw syncErr;
        }
      }
    }
  } catch (error) {
    logger.error(`Model sync failed: ${error.message}`);
  }

  // 3. Seed sample data if tables are empty
  try {
    await seedDatabase();
  } catch (error) {
    logger.warn(`Seeding skipped: ${error.message}`);
  }

  // 4. Auto-create admin account (best-effort — never crash the server)
  try {
    const { User } = await import('./models/index.js');
    const adminExists = await User.findOne({ where: { role: 'admin' } });
    if (!adminExists) {
      const adminEmail = process.env.ADMIN_EMAIL || 'admin@onestep.com';
      const adminPassword = process.env.ADMIN_PASSWORD || 'Admin@123';

      // Try Firebase admin SDK — this requires service account credentials
      try {
        const admin = (await import('firebase-admin')).default;
        let firebaseUser;
        try {
          firebaseUser = await admin.auth().getUserByEmail(adminEmail);
        } catch {
          firebaseUser = await admin.auth().createUser({
            email: adminEmail, password: adminPassword,
            displayName: 'Admin', emailVerified: true,
          });
        }
        await User.findOrCreate({
          where: { uid: firebaseUser.uid },
          defaults: {
            uid: firebaseUser.uid,
            email: adminEmail,
            displayName: 'Admin',
            photoURL: '',
            role: 'admin',
          },
        });
        logger.info(`Admin account created via Firebase: ${adminEmail}`);
      } catch (fbErr) {
        // Firebase failed — create a local-only admin account for JWT-based login
        logger.warn(`Firebase admin setup failed: ${fbErr.message}`);
        try {
          await User.findOrCreate({
            where: { email: adminEmail },
            defaults: {
              uid: `local_admin_${Date.now()}`,
              email: adminEmail,
              displayName: 'Admin',
              photoURL: '',
              role: 'admin',
            },
          });
          logger.info(`Local admin account created: ${adminEmail}`);
        } catch (localErr) {
          logger.warn(`Local admin creation also failed: ${localErr.message}`);
        }
      }
    } else {
      logger.info(`Admin account exists: ${adminExists.email}`);
    }

    // Auto-create test user in development only
    if (!isProduction) {
      try {
        const testUserExists = await User.findOne({ where: { email: 'user@onestep.com' } });
        if (!testUserExists) {
          const admin = (await import('firebase-admin')).default;
          let firebaseUser;
          try {
            firebaseUser = await admin.auth().getUserByEmail('user@onestep.com');
          } catch {
            firebaseUser = await admin.auth().createUser({
              email: 'user@onestep.com', password: 'User@123',
              displayName: 'Test User', emailVerified: true,
            });
          }
          await User.findOrCreate({
            where: { uid: firebaseUser.uid },
            defaults: {
              uid: firebaseUser.uid,
              email: 'user@onestep.com',
              displayName: 'Test User',
              photoURL: '',
              role: 'user',
            },
          });
          logger.info('Test user account created: user@onestep.com');
        }
      } catch (err) {
        logger.warn(`Test user setup skipped: ${err.message}`);
      }
    }
  } catch (err) {
    logger.warn(`Account auto-setup skipped: ${err.message}`);
  }

  // 5. Start listening — this ALWAYS runs regardless of above errors
  app.listen(PORT, '0.0.0.0', () => {
    logger.info(`🚀 Backend running on http://localhost:${PORT}`);
    logger.info(`   Environment: ${process.env.NODE_ENV || 'development'}`);
    logger.info(`   Database: ${process.env.DB_DIALECT || 'sqlite'}`);
    logger.info(`   API: /api/v1/* (versioned) + /api/* (legacy)`);
  });
}

start();

