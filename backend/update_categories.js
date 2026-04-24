import { Category } from './src/models/index.js';

async function updateCategories() {
  const updates = [
    { name: 'Lifestyle', image: '/uploads/images/banner-3.jpg' },
    { name: 'Apparel', image: '/uploads/images/banner-1.jpg' },
    { name: 'Kids', image: '/uploads/images/prod-sneakers.jpg' },
    { name: 'Women', image: '/uploads/images/prod-dress.jpg' }
  ];

  for (const up of updates) {
    const [count] = await Category.update(
      { image: up.image },
      { where: { name: up.name } }
    );
    console.log(`Updated category ${up.name}: ${count} rows affected`);
  }
  process.exit(0);
}

updateCategories();
