
const { Product, Category } = require('./backend/src/models/index.js');

async function checkData() {
  try {
    const products = await Product.findAll({ limit: 10 });
    console.log('--- Products ---');
    products.forEach(p => {
      console.log(`ID: ${p.id}, Name: ${p.name}, Category: ${p.category}`);
    });

    const categories = await Category.findAll();
    console.log('\n--- Categories ---');
    categories.forEach(c => {
      console.log(`ID: ${c.id}, Name: ${c.name}`);
    });
  } catch (err) {
    console.error(err);
  } finally {
    process.exit();
  }
}

checkData();
