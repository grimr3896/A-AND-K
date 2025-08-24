
import { PrismaClient } from '@prisma/client'
const prisma = new PrismaClient()

async function main() {
    console.log('--- Starting Test Data Seeding ---');

    const products = [
      // Clothes
      { id: 'PROD001', name: 'Organic Cotton Onesie (3-pack)', sku: 'CL-OC-01', category: 'Clothes', stock: 50, price: 3200, lowStockThreshold: 15, cost: 1800, minPrice: 3000, supplier: 'Baby Threads Co.', description: 'Soft, breathable 100% organic cotton onesies.' },
      { id: 'PROD002', name: 'Fleece-Lined Baby Jacket', sku: 'CL-FJ-02', category: 'Clothes', stock: 25, price: 4500, lowStockThreshold: 10, cost: 2500, minPrice: 4200, supplier: 'Cozy Kids', description: 'A warm and cozy fleece-lined jacket for chilly days.' },
      { id: 'PROD004', name: 'Sleep & Play Footie Pajamas', sku: 'CL-SP-04', category: 'Clothes', stock: 40, price: 2800, lowStockThreshold: 10, cost: 1500, minPrice: 2600, supplier: 'Dreamy Baby', description: 'Comfortable one-piece pajamas for sleep and play.' },
      { id: 'PROD005', name: 'Denim Baby Overalls', sku: 'CL-DO-05', category: 'Clothes', stock: 18, price: 3800, lowStockThreshold: 5, cost: 2200, minPrice: 3500, supplier: 'Cozy Kids', description: 'Stylish and durable denim overalls for toddlers.' },
      
      // Accessories
      { id: 'PROD003', name: 'Knit Baby Booties', sku: 'AC-KB-03', category: 'Accessories', stock: 60, price: 1500, lowStockThreshold: 20, cost: 800, minPrice: 1400, supplier: 'Baby Threads Co.', description: 'Hand-knitted baby booties to keep little feet warm.' },
      { id: 'PROD021', name: 'Sun Hat with UV Protection', sku: 'AC-SH-05', category: 'Accessories', stock: 50, price: 1800, lowStockThreshold: 15, cost: 900, minPrice: 1600, supplier: 'SunSafe Kids', description: 'A wide-brimmed sun hat with UPF 50+ protection.' },
      
      // Blankets
      { id: 'PROD022', name: 'Muslin Swaddle Blankets (4-pack)', sku: 'BL-MS-01', category: 'Blankets', stock: 80, price: 3500, lowStockThreshold: 20, cost: 2000, minPrice: 3200, supplier: 'SnuggleBug', description: 'Lightweight and breathable muslin swaddle blankets.' },
      { id: 'PROD023', name: 'Plush Baby Blanket', sku: 'BL-PB-02', category: 'Blankets', stock: 40, price: 2800, lowStockThreshold: 10, cost: 1500, minPrice: 2600, supplier: 'Cuddle Toys', description: 'An ultra-soft plush blanket for cuddling and naps.' },
      
      // Shoes
      { id: 'PROD024', name: 'Soft Sole Leather Baby Shoes', sku: 'SH-SL-01', category: 'Shoes', stock: 55, price: 2200, lowStockThreshold: 15, cost: 1200, minPrice: 2000, supplier: 'Tiny Toes', description: 'Flexible soft sole shoes perfect for first walkers.' },
      { id: 'PROD025', name: 'Baby Sneakers with Velcro', sku: 'SH-SV-02', category: 'Shoes', stock: 30, price: 3000, lowStockThreshold: 10, cost: 1700, minPrice: 2800, supplier: 'Kiddy Kicks', description: 'Stylish and easy-to-wear sneakers for toddlers.' },
      
      // Bags
      { id: 'PROD026', name: 'Diaper Bag Backpack', sku: 'BG-DB-01', category: 'Bags', stock: 25, price: 8500, lowStockThreshold: 5, cost: 5000, minPrice: 8000, supplier: 'MomGo', description: 'A spacious and stylish diaper bag with multiple compartments.' },
      { id: 'PROD027', name: 'Toddler Character Backpack', sku: 'BG-TB-02', category: 'Bags', stock: 40, price: 2500, lowStockThreshold: 10, cost: 1400, minPrice: 2300, supplier: 'Playful Packs', description: 'A cute and fun backpack for your toddler\'s essentials.' },
    ];

    for (const product of products) {
        await prisma.product.upsert({
            where: { id: product.id },
            update: {},
            create: product,
        });
    }

    console.log(`Seeded ${products.length} products.`);
    console.log('--- Seeding Complete ---');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
