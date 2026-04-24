import { Category } from './src/models/index.js';

async function check() {
  const categories = await Category.findAll();
  console.log(JSON.stringify(categories, null, 2));
  process.exit(0);
}

check();
