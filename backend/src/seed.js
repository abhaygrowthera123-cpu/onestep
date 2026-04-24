import { Product, Category, Coupon, SiteSetting } from './models/index.js';

const SAMPLE_CATEGORIES = [
  {
    name: 'Men',
    description: 'Premium menswear collection featuring contemporary cuts and classic styling.',
    image: '/uploads/images/cat-men.jpg',
  },
  {
    name: 'Women',
    description: 'Curated women\'s fashion from luxury designers and emerging labels.',
    image: '/uploads/images/cat-women.jpg',
  },
  {
    name: 'Accessories',
    description: 'Premium bags, watches, jewellery, and finishing touches.',
    image: '/uploads/images/cat-accessories.jpg',
  },
  {
    name: 'Footwear',
    description: 'Handcrafted shoes and sneakers from the world\'s finest makers.',
    image: '/uploads/images/cat-footwear.jpg',
  },
  {
    name: 'Kids',
    description: 'Fashionable and comfortable clothing for children of all ages.',
    image: 'https://images.unsplash.com/photo-1519233073526-69057b3026bb?auto=format&fit=crop&q=80&w=800',
  },
  {
    name: 'Lifestyle',
    description: 'Elevate your daily living with curated home and utility essentials.',
    image: 'https://images.unsplash.com/photo-1511499767390-903390e6fbc4?auto=format&fit=crop&q=80&w=800',
  },
];

const SAMPLE_PRODUCTS = [
  {
    name: 'Premium Slim-Fit Italian Wool Blazer',
    description: 'Expertly tailored from finest Italian wool. Features a contemporary slim fit with half-canvas construction for a natural drape. Notch lapel, double-vent back, and horn buttons.',
    price: 12999,
    discountPrice: 9999,
    category: 'Men',
    brand: 'ONESTEP',
    images: ['/uploads/images/prod-blazer.jpg'],
    sizes: ['S', 'M', 'L', 'XL', 'XXL'],
    colors: ['Navy', 'Charcoal', 'Black'],
    rating: 4.8,
    reviewsCount: 234,
    isTrending: true,
    isRecommended: true,
    stock: 50,
  },
  {
    name: 'Handcrafted Leather Derby Shoes',
    description: 'Classic derby shoes crafted from full-grain calf leather with Blake-stitched leather soles. Burnished toe cap and hand-polished finish for a distinguished look.',
    price: 8499,
    discountPrice: 6999,
    category: 'Footwear',
    brand: 'ONESTEP',
    images: ['/uploads/images/prod-shoes.jpg'],
    sizes: ['UK 6', 'UK 7', 'UK 8', 'UK 9', 'UK 10', 'UK 11'],
    colors: ['Tan', 'Dark Brown', 'Black'],
    rating: 4.9,
    reviewsCount: 189,
    isTrending: true,
    stock: 35,
  },
  {
    name: 'Cashmere Blend Overcoat',
    description: 'Luxurious overcoat in a premium cashmere-wool blend. Single-breasted design with peak lapels, welt pockets, and a full satin lining. Perfect for the modern gentleman.',
    price: 18999,
    discountPrice: 14999,
    category: 'Men',
    brand: 'ONESTEP',
    images: ['/uploads/images/prod-overcoat.jpg'],
    sizes: ['S', 'M', 'L', 'XL'],
    colors: ['Camel', 'Grey', 'Navy'],
    rating: 4.7,
    reviewsCount: 156,
    isTrending: true,
    isRecommended: true,
    stock: 25,
  },
  {
    name: 'Silk Wrap Midi Dress',
    description: 'Elegant wrap dress in pure mulberry silk with a flattering midi length. Features a V-neckline, self-tie waist, and fluid drape for effortless sophistication.',
    price: 9499,
    discountPrice: 7499,
    category: 'Women',
    brand: 'ONESTEP',
    images: ['/uploads/images/prod-dress.jpg'],
    sizes: ['XS', 'S', 'M', 'L', 'XL'],
    colors: ['Emerald', 'Burgundy', 'Midnight'],
    rating: 4.9,
    reviewsCount: 312,
    isTrending: true,
    stock: 40,
  },
  {
    name: 'Premium Leather Crossbody Bag',
    description: 'Handcrafted from vegetable-tanned Italian leather with brass hardware. Adjustable strap, multiple compartments, and signature branded lining.',
    price: 5999,
    discountPrice: null,
    category: 'Accessories',
    brand: 'ONESTEP',
    images: ['/uploads/images/prod-bag.jpg'],
    sizes: ['One Size'],
    colors: ['Cognac', 'Black', 'Olive'],
    rating: 4.6,
    reviewsCount: 198,
    isTrending: false,
    isRecommended: true,
    stock: 60,
  },
  {
    name: 'Tailored Linen Shirt',
    description: 'Breathable European linen shirt with mother-of-pearl buttons. Relaxed fit with gentle tapering at the waist. Perfect for warm days and resort evenings.',
    price: 3999,
    discountPrice: 2999,
    category: 'Men',
    brand: 'ONESTEP',
    images: ['/uploads/images/prod-shirt.jpg'],
    sizes: ['S', 'M', 'L', 'XL', 'XXL'],
    colors: ['White', 'Sky Blue', 'Sage'],
    rating: 4.5,
    reviewsCount: 267,
    isTrending: true,
    stock: 80,
  },
  {
    name: 'Crystal Embellished Stiletto Heels',
    description: 'Show-stopping stiletto heels adorned with hand-placed Swarovski crystals. Satin upper with leather sole and padded insole for all-night comfort.',
    price: 11999,
    discountPrice: 8999,
    category: 'Footwear',
    brand: 'ONESTEP',
    images: ['/uploads/images/prod-heels.jpg'],
    sizes: ['UK 3', 'UK 4', 'UK 5', 'UK 6', 'UK 7', 'UK 8'],
    colors: ['Gold', 'Silver', 'Rose Gold'],
    rating: 4.8,
    reviewsCount: 145,
    isTrending: true,
    isRecommended: true,
    stock: 30,
  },
  {
    name: 'Structured Wool Trouser',
    description: 'Impeccably tailored trousers in super 120s wool. Features a mid-rise waist, forward-facing pleats, and a tapered leg for a clean, modern silhouette.',
    price: 5499,
    discountPrice: 4499,
    category: 'Men',
    brand: 'ONESTEP',
    images: ['/uploads/images/prod-trouser.jpg'],
    sizes: ['28', '30', '32', '34', '36', '38'],
    colors: ['Charcoal', 'Navy', 'Light Grey'],
    rating: 4.7,
    reviewsCount: 203,
    isTrending: false,
    isRecommended: true,
    stock: 55,
  },
  {
    name: 'Classic White Sneakers',
    description: 'Minimalist white sneakers crafted from premium Italian leather. Clean lines, margom rubber soles, and calfskin lining for ultimate comfort.',
    price: 6999,
    discountPrice: 4999,
    category: 'Footwear',
    brand: 'ONESTEP',
    images: ['/uploads/images/prod-sneakers.jpg'],
    sizes: ['UK 6', 'UK 7', 'UK 8', 'UK 9', 'UK 10'],
    colors: ['White', 'Off-White'],
    rating: 4.9,
    reviewsCount: 450,
    isTrending: true,
    isRecommended: true,
    stock: 100,
  },
  {
    name: 'Pleated Floral Skirt',
    description: 'Beautifully pleated midi skirt with a vibrant floral print. Lightweight fabric that moves gracefully with every step.',
    price: 3499,
    discountPrice: 2499,
    category: 'Women',
    brand: 'ONESTEP',
    images: ['/uploads/images/prod-skirt.jpg'],
    sizes: ['S', 'M', 'L'],
    colors: ['Floral', 'Blush'],
    rating: 4.6,
    reviewsCount: 89,
    isTrending: false,
    isRecommended: true,
    stock: 45,
  },
  {
    name: 'Aviator Sunglasses',
    description: 'Classic aviator silhouette with polarized lenses and lightweight titanium frames. Provides 100% UV protection with timeless style.',
    price: 2999,
    discountPrice: 1999,
    category: 'Accessories',
    brand: 'ONESTEP',
    images: ['/uploads/images/prod-sunglasses.jpg'],
    sizes: ['Standard'],
    colors: ['Gold/Green', 'Silver/Black'],
    rating: 4.7,
    reviewsCount: 120,
    isTrending: true,
    isRecommended: false,
    stock: 75,
  },
  {
    name: 'Kids Denim Jacket',
    description: 'Durable and stylish denim jacket for kids. Features a classic four-pocket design and button closures. Perfect for layering.',
    price: 2499,
    discountPrice: 1499,
    category: 'Kids',
    brand: 'ONESTEP',
    images: ['/uploads/images/prod-denim-jacket.jpg'],
    sizes: ['2Y', '4Y', '6Y', '8Y'],
    colors: ['Blue Denim', 'Light Wash'],
    rating: 4.5,
    reviewsCount: 65,
    isTrending: false,
    isRecommended: true,
    stock: 50,
  },
  {
    name: 'Minimalist Wall Clock',
    description: 'Sleek and modern wall clock with a brushed aluminum frame. Silent movement and clean interface, perfect for contemporary offices or homes.',
    price: 1499,
    discountPrice: 999,
    category: 'Lifestyle',
    brand: 'ONESTEP',
    images: ['/uploads/images/prod-wall-clock.jpg'],
    sizes: ['30cm'],
    colors: ['Silver', 'Black', 'White'],
    rating: 4.8,
    reviewsCount: 310,
    isTrending: true,
    isRecommended: true,
    stock: 120,
  },
];

export async function seedDatabase() {
  try {
    const categoryCount = await Category.count();
    if (categoryCount === 0) {
      console.log('📦 Seeding categories...');
      await Category.bulkCreate(SAMPLE_CATEGORIES);
      console.log(`   ✅ ${SAMPLE_CATEGORIES.length} categories created`);
    }

    const productCount = await Product.count();
    if (productCount === 0) {
      console.log('📦 Seeding products...');
      await Product.bulkCreate(SAMPLE_PRODUCTS);
      console.log(`   ✅ ${SAMPLE_PRODUCTS.length} products created`);
    }

    const couponCount = await Coupon.count();
    if (couponCount === 0) {
      await Coupon.create({
        code: 'WELCOME10',
        type: 'percent',
        value: 10,
        minOrderAmount: 500,
        maxDiscountAmount: 500,
        usageLimit: 10000,
        isActive: true,
      });
      console.log('   ✅ Default coupon WELCOME10 created');
    }

    const storeRow = await SiteSetting.findByPk('store');
    if (!storeRow) {
      await SiteSetting.create({
        key: 'store',
        value: JSON.stringify({
          name: 'OneStep Hub',
          gstin: '',
          supportEmail: 'support@onestep.com',
          supportPhone: '',
          gstDisplayText: 'Prices inclusive of GST where applicable',
        }),
      });
      console.log('   ✅ Default store settings created');
    }
  } catch (error) {
    console.error('⚠️  Seed error (non-fatal):', error.message);
  }
}
