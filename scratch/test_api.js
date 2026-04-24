
import axios from 'axios';

async function testFilter() {
  try {
    const res = await axios.get('http://localhost:5000/api/products?category=Women');
    console.log('Response Status:', res.status);
    console.log('Data Length:', res.data.data.length);
    console.log('Sample Product:', res.data.data[0]?.name);
  } catch (err) {
    console.error('Error:', err.message);
  }
}

testFilter();
