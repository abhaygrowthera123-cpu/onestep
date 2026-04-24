import { Product } from './src/models/index.js';
import fs from 'fs';
import path from 'path';

async function auditDisk() {
  const products = await Product.findAll();
  const baseDir = 'c:/Users/GCV/Desktop/onestep-hub/backend';
  
  for (const p of products) {
    if (p.images && p.images.length > 0) {
      const imgPath = path.join(baseDir, p.images[0]);
      if (!fs.existsSync(imgPath)) {
        console.log(`MISSING DISK FILE: ${p.name} -> ${p.images[0]}`);
      }
    } else {
      console.log(`NO IMAGE DEFINED: ${p.name}`);
    }
  }
  process.exit(0);
}

auditDisk();
