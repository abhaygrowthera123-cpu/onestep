import { Sequelize, DataTypes } from 'sequelize';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

// Load .env early so DB_DIALECT is available (ES module imports are hoisted)
dotenv.config({ path: path.resolve(__dirname, '../../../.env') });

// Use SQLite for zero-config local development, MySQL for production
const DB_DIALECT = process.env.DB_DIALECT || 'sqlite';

// Ensure data directory exists BEFORE Sequelize tries to open the SQLite file
if (DB_DIALECT === 'sqlite') {
  const dataDir = path.resolve(__dirname, '../../data');
  if (!fs.existsSync(dataDir)) {
    fs.mkdirSync(dataDir, { recursive: true });
  }
}

let sequelize;

if (process.env.DATABASE_URL) {
  // PostgreSQL (managed, e.g., Render/Heroku)
  sequelize = new Sequelize(process.env.DATABASE_URL, {
    dialect: 'postgres',
    logging: false,
    dialectOptions: {
      ssl: process.env.NODE_ENV === 'production' ? { require: true, rejectUnauthorized: false } : false
    }
  });
} else if (DB_DIALECT === 'mysql') {
  sequelize = new Sequelize(
    process.env.DB_NAME || 'onestep_db',
    process.env.DB_USER || 'root',
    process.env.DB_PASSWORD || '',
    {
      host: process.env.DB_HOST || 'localhost',
      port: parseInt(process.env.DB_PORT || '3306'),
      dialect: 'mysql',
      logging: false,
      pool: { max: 10, min: 2, acquire: 30000, idle: 10000 },
    }
  );
} else {
  // SQLite — zero-config, works out of the box
  const dbPath = path.resolve(__dirname, '../../data/onestep.sqlite');
  sequelize = new Sequelize({
    dialect: 'sqlite',
    storage: dbPath,
    logging: false,
  });
}

// ── Product Model ──────────────────────────────────────────────
const Product = sequelize.define('Product', {
  id: { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true },
  sellerId: { type: DataTypes.STRING },
  name: { type: DataTypes.STRING, allowNull: false },
  slug: { type: DataTypes.STRING, unique: true },
  description: { type: DataTypes.TEXT },
  price: { type: DataTypes.DECIMAL(10, 2), allowNull: false },
  discountPrice: { type: DataTypes.DECIMAL(10, 2) },
  category: { type: DataTypes.STRING, allowNull: false },
  brand: { type: DataTypes.STRING },
  images: { type: DataTypes.JSON, allowNull: false },
  sizes: { type: DataTypes.JSON },
  colors: { type: DataTypes.JSON },
  rating: { type: DataTypes.FLOAT, defaultValue: 0 },
  reviewsCount: { type: DataTypes.INTEGER, defaultValue: 0 },
  isTrending: { type: DataTypes.BOOLEAN, defaultValue: false },
  isRecommended: { type: DataTypes.BOOLEAN, defaultValue: false },
  isActive: { type: DataTypes.BOOLEAN, defaultValue: true },
  stock: { type: DataTypes.INTEGER, defaultValue: 0 },
  minOrderQty: { type: DataTypes.INTEGER, defaultValue: 1 },
  tags: { type: DataTypes.JSON, defaultValue: [] },
  specifications: { type: DataTypes.JSON, defaultValue: {} },
});

// ── ProductVariant Model ───────────────────────────────────────
const ProductVariant = sequelize.define('ProductVariant', {
  id: { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true },
  productId: { type: DataTypes.UUID, allowNull: false },
  sku: { type: DataTypes.STRING, unique: true },
  size: { type: DataTypes.STRING },
  color: { type: DataTypes.STRING },
  material: { type: DataTypes.STRING },
  stock: { type: DataTypes.INTEGER, defaultValue: 0 },
  reservedStock: { type: DataTypes.INTEGER, defaultValue: 0 },
  price: { type: DataTypes.DECIMAL(10, 2) },
  image: { type: DataTypes.STRING },
  isActive: { type: DataTypes.BOOLEAN, defaultValue: true },
});

// ── Category Model ─────────────────────────────────────────────
const Category = sequelize.define('Category', {
  id: { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true },
  name: { type: DataTypes.STRING, allowNull: false, unique: true },
  description: { type: DataTypes.TEXT },
  image: { type: DataTypes.STRING },
});

// ── Order Model ────────────────────────────────────────────────
const Order = sequelize.define('Order', {
  id: { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true },
  orderNumber: { type: DataTypes.STRING, unique: true },
  userId: { type: DataTypes.STRING, allowNull: false },
  items: { type: DataTypes.JSON, allowNull: false },
  totalAmount: { type: DataTypes.DECIMAL(10, 2), allowNull: false },
  status: {
    type: DataTypes.STRING,
    defaultValue: 'pending',
    validate: { isIn: [['pending', 'confirmed', 'packed', 'shipped', 'out_for_delivery', 'delivered', 'cancelled', 'return_requested', 'returned', 'refunded']] },
  },
  address: { type: DataTypes.JSON, allowNull: false },
  paymentMethod: { type: DataTypes.STRING, allowNull: false },
  paymentStatus: { type: DataTypes.STRING, defaultValue: 'pending' },
  paymentId: { type: DataTypes.STRING },
  trackingId: { type: DataTypes.STRING },
  trackingUrl: { type: DataTypes.STRING },
  courierName: { type: DataTypes.STRING },
  cancelReason: { type: DataTypes.TEXT },
  notes: { type: DataTypes.TEXT },
  shippedAt: { type: DataTypes.DATE },
  deliveredAt: { type: DataTypes.DATE },
  subtotalAmount: { type: DataTypes.DECIMAL(10, 2) },
  discountAmount: { type: DataTypes.DECIMAL(10, 2), defaultValue: 0 },
  walletAmount: { type: DataTypes.DECIMAL(10, 2), defaultValue: 0 },
  couponCode: { type: DataTypes.STRING },
  razorpayOrderId: { type: DataTypes.STRING },
  razorpayPaymentId: { type: DataTypes.STRING },
  gstNote: { type: DataTypes.STRING },
  returnReason: { type: DataTypes.TEXT },
  returnRequestedAt: { type: DataTypes.DATE },
  couponRedeemed: { type: DataTypes.BOOLEAN, defaultValue: false },
});

// ── User Model ─────────────────────────────────────────────────
const User = sequelize.define('User', {
  uid: { type: DataTypes.STRING, primaryKey: true },
  email: { type: DataTypes.STRING, allowNull: false, unique: true },
  displayName: { type: DataTypes.STRING },
  phone: { type: DataTypes.STRING },
  photoURL: { type: DataTypes.STRING },
  role: { type: DataTypes.STRING, defaultValue: 'user' },
  isActive: { type: DataTypes.BOOLEAN, defaultValue: true },
  isVerified: { type: DataTypes.BOOLEAN, defaultValue: false },
  lastLoginAt: { type: DataTypes.DATE },
  walletBalance: { type: DataTypes.DECIMAL(10, 2), defaultValue: 0 },
  sellerShopName: { type: DataTypes.STRING },
  sellerGstin: { type: DataTypes.STRING },
  sellerPhone: { type: DataTypes.STRING },
  wishlist: { type: DataTypes.JSON, defaultValue: [] },
});

// ── Review Model ───────────────────────────────────────────────
const Review = sequelize.define('Review', {
  id: { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true },
  productId: { type: DataTypes.UUID, allowNull: false },
  userId: { type: DataTypes.STRING, allowNull: false },
  orderId: { type: DataTypes.UUID },
  rating: { type: DataTypes.INTEGER, allowNull: false, validate: { min: 1, max: 5 } },
  title: { type: DataTypes.STRING },
  comment: { type: DataTypes.TEXT },
  images: { type: DataTypes.JSON, defaultValue: [] },
  isVerified: { type: DataTypes.BOOLEAN, defaultValue: false },
  helpfulCount: { type: DataTypes.INTEGER, defaultValue: 0 },
});

// ── Address Model ──────────────────────────────────────────────
const Address = sequelize.define('Address', {
  id: { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true },
  userId: { type: DataTypes.STRING, allowNull: false },
  name: { type: DataTypes.STRING, defaultValue: 'Home' }, // Home, Work, etc.
  addressLine1: { type: DataTypes.STRING, allowNull: false },
  addressLine2: { type: DataTypes.STRING },
  city: { type: DataTypes.STRING, allowNull: false },
  state: { type: DataTypes.STRING, allowNull: false },
  zipCode: { type: DataTypes.STRING, allowNull: false },
  country: { type: DataTypes.STRING, defaultValue: 'India' },
  latitude: { type: DataTypes.DECIMAL(10, 8) },
  longitude: { type: DataTypes.DECIMAL(11, 8) },
  isDefault: { type: DataTypes.BOOLEAN, defaultValue: false },
  phoneNumber: { type: DataTypes.STRING },
});

// ── Contact Model ──────────────────────────────────────────────
const Contact = sequelize.define('Contact', {
  id: { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true },
  name: { type: DataTypes.STRING, allowNull: false },
  email: { type: DataTypes.STRING, allowNull: false },
  subject: { type: DataTypes.STRING },
  message: { type: DataTypes.TEXT, allowNull: false },
  isRead: { type: DataTypes.BOOLEAN, defaultValue: false },
});

// ── Newsletter Model ───────────────────────────────────────────
const Newsletter = sequelize.define('Newsletter', {
  id: { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true },
  email: { type: DataTypes.STRING, allowNull: false, unique: true },
  isActive: { type: DataTypes.BOOLEAN, defaultValue: true },
});

// ── Coupon Model ───────────────────────────────────────────────
const Coupon = sequelize.define('Coupon', {
  id: { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true },
  code: { type: DataTypes.STRING, allowNull: false, unique: true },
  type: { type: DataTypes.STRING, allowNull: false },
  value: { type: DataTypes.DECIMAL(10, 2), allowNull: false },
  minOrderAmount: { type: DataTypes.DECIMAL(10, 2), defaultValue: 0 },
  maxDiscountAmount: { type: DataTypes.DECIMAL(10, 2) },
  usageLimit: { type: DataTypes.INTEGER },
  usedCount: { type: DataTypes.INTEGER, defaultValue: 0 },
  expiresAt: { type: DataTypes.DATE },
  isActive: { type: DataTypes.BOOLEAN, defaultValue: true },
});

// ── SiteSetting (key-value JSON) ──────────────────────────────
const SiteSetting = sequelize.define('SiteSetting', {
  key: { type: DataTypes.STRING, primaryKey: true },
  value: { type: DataTypes.TEXT, allowNull: false },
});

// ── Associations ───────────────────────────────────────────────
User.hasMany(Order, { foreignKey: 'userId', sourceKey: 'uid' });
Order.belongsTo(User, { foreignKey: 'userId', targetKey: 'uid' });

Product.hasMany(ProductVariant, { foreignKey: 'productId', as: 'variants', onDelete: 'CASCADE' });
ProductVariant.belongsTo(Product, { foreignKey: 'productId' });

Product.hasMany(Review, { foreignKey: 'productId', as: 'reviews', onDelete: 'CASCADE' });
Review.belongsTo(Product, { foreignKey: 'productId' });
User.hasMany(Review, { foreignKey: 'userId', sourceKey: 'uid', as: 'reviews' });
Review.belongsTo(User, { foreignKey: 'userId', targetKey: 'uid' });

User.hasMany(Address, { foreignKey: 'userId', sourceKey: 'uid', as: 'addresses', onDelete: 'CASCADE' });
Address.belongsTo(User, { foreignKey: 'userId', targetKey: 'uid' });

export { sequelize, Product, ProductVariant, Category, Order, User, Review, Address, Contact, Newsletter, Coupon, SiteSetting };
