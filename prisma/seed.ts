
import { PrismaClient } from '@prisma/client'
import { subDays } from 'date-fns';
const prisma = new PrismaClient()

async function main() {
    console.log('--- Starting Test Data Seeding ---');
    
    // --- Products ---
    console.log('Seeding products...');
    const productsData = [
      { id: 'PROD001', name: 'Organic Cotton Onesie (3-pack)', sku: 'CL-OC-01', category: 'Clothes', stock: 50, price: 3200, lowStockThreshold: 15, cost: 1800, minPrice: 3000, supplier: 'Baby Threads Co.', description: 'Soft, breathable 100% organic cotton onesies.' },
      { id: 'PROD002', name: 'Fleece-Lined Baby Jacket', sku: 'CL-FJ-02', category: 'Clothes', stock: 25, price: 4500, lowStockThreshold: 10, cost: 2500, minPrice: 4200, supplier: 'Cozy Kids', description: 'A warm and cozy fleece-lined jacket for chilly days.' },
      { id: 'PROD004', name: 'Sleep & Play Footie Pajamas', sku: 'CL-SP-04', category: 'Clothes', stock: 40, price: 2800, lowStockThreshold: 10, cost: 1500, minPrice: 2600, supplier: 'Dreamy Baby', description: 'Comfortable one-piece pajamas for sleep and play.' },
      { id: 'PROD005', name: 'Denim Baby Overalls', sku: 'CL-DO-05', category: 'Clothes', stock: 18, price: 3800, lowStockThreshold: 5, cost: 2200, minPrice: 3500, supplier: 'Cozy Kids', description: 'Stylish and durable denim overalls for toddlers.' },
      { id: 'PROD003', name: 'Knit Baby Booties', sku: 'AC-KB-03', category: 'Accessories', stock: 60, price: 1500, lowStockThreshold: 20, cost: 800, minPrice: 1400, supplier: 'Baby Threads Co.', description: 'Hand-knitted baby booties to keep little feet warm.' },
      { id: 'PROD021', name: 'Sun Hat with UV Protection', sku: 'AC-SH-05', category: 'Accessories', stock: 50, price: 1800, lowStockThreshold: 15, cost: 900, minPrice: 1600, supplier: 'SunSafe Kids', description: 'A wide-brimmed sun hat with UPF 50+ protection.' },
      { id: 'PROD022', name: 'Muslin Swaddle Blankets (4-pack)', sku: 'BL-MS-01', category: 'Blankets', stock: 80, price: 3500, lowStockThreshold: 20, cost: 2000, minPrice: 3200, supplier: 'SnuggleBug', description: 'Lightweight and breathable muslin swaddle blankets.' },
      { id: 'PROD023', name: 'Plush Baby Blanket', sku: 'BL-PB-02', category: 'Blankets', stock: 40, price: 2800, lowStockThreshold: 10, cost: 1500, minPrice: 2600, supplier: 'Cuddle Toys', description: 'An ultra-soft plush blanket for cuddling and naps.' },
      { id: 'PROD024', name: 'Soft Sole Leather Baby Shoes', sku: 'SH-SL-01', category: 'Shoes', stock: 55, price: 2200, lowStockThreshold: 15, cost: 1200, minPrice: 2000, supplier: 'Tiny Toes', description: 'Flexible soft sole shoes perfect for first walkers.' },
      { id: 'PROD025', name: 'Baby Sneakers with Velcro', sku: 'SH-SV-02', category: 'Shoes', stock: 30, price: 3000, lowStockThreshold: 10, cost: 1700, minPrice: 2800, supplier: 'Kiddy Kicks', description: 'Stylish and easy-to-wear sneakers for toddlers.' },
      { id: 'PROD026', name: 'Diaper Bag Backpack', sku: 'BG-DB-01', category: 'Bags', stock: 25, price: 8500, lowStockThreshold: 5, cost: 5000, minPrice: 8000, supplier: 'MomGo', description: 'A spacious and stylish diaper bag with multiple compartments.' },
      { id: 'PROD027', name: 'Toddler Character Backpack', sku: 'BG-TB-02', category: 'Bags', stock: 40, price: 2500, lowStockThreshold: 10, cost: 1400, minPrice: 2300, supplier: 'Playful Packs', description: 'A cute and fun backpack for your toddler\'s essentials.' },
    ];
    
    for (const product of productsData) {
        await prisma.product.upsert({ where: { id: product.id }, update: {}, create: product });
    }
    console.log(`Seeded ${productsData.length} products.`);

    // --- Sales ---
    console.log('Seeding sales...');
    const now = new Date();
    const salesData = [
      { id: 'SALE001', date: subDays(now, 1), customerName: 'Jane Doe', paymentMethod: 'Card', items: [{ productId: 'PROD001', quantity: 1, price: 3200 }, { productId: 'PROD003', quantity: 1, price: 1500 }] },
      { id: 'SALE002', date: subDays(now, 2), customerName: 'John Smith', paymentMethod: 'M-Pesa', items: [{ productId: 'PROD025', quantity: 1, price: 3000 }] },
      { id: 'SALE003', date: subDays(now, 4), customerName: 'Alice Johnson', paymentMethod: 'Cash', items: [{ productId: 'PROD026', quantity: 1, price: 8500 }] },
      { id: 'SALE004', date: subDays(now, 5), customerName: 'Bob Williams', paymentMethod: 'Card', items: [{ productId: 'PROD004', quantity: 2, price: 2800 }] },
      { id: 'SALE005', date: subDays(now, 6), customerName: 'Charlie Brown', paymentMethod: 'Card', items: [{ productId: 'PROD022', quantity: 1, price: 3500 }] },
      { id: 'SALE006', date: subDays(now, 8), customerName: 'Diana Prince', paymentMethod: 'M-Pesa', items: [{ productId: 'PROD002', quantity: 1, price: 4500 }, { productId: 'PROD003', quantity: 2, price: 1500 }] },
    ];

    for (const sale of salesData) {
        const total = sale.items.reduce((acc, item) => acc + item.price * item.quantity, 0);
        await prisma.sale.upsert({
            where: { id: sale.id },
            update: {},
            create: {
                id: sale.id,
                date: sale.date,
                customerName: sale.customerName,
                paymentMethod: sale.paymentMethod,
                total: total,
                items: {
                    create: sale.items.map(item => ({
                        productId: item.productId,
                        name: productsData.find(p => p.id === item.productId)?.name || 'Unknown Product',
                        quantity: item.quantity,
                        price: item.price,
                    })),
                },
            },
        });
    }
    console.log(`Seeded ${salesData.length} sales.`);

    // --- Layaways ---
    console.log('Seeding layaways...');
    const layawaysData = [
        { id: 'LAY001', customerName: 'Fiona Glenanne', productName: 'Diaper Bag Backpack', totalAmount: 8500, amountPaid: 4000, status: 'Pending', lastPaymentDate: subDays(now, 7) },
        { id: 'LAY002', customerName: 'George Mason', productName: 'Plush Baby Blanket', totalAmount: 2800, amountPaid: 2800, status: 'Paid', lastPaymentDate: subDays(now, 15) },
        { id: 'LAY003', customerName: 'Hannah Abbott', productName: 'Fleece-Lined Baby Jacket', totalAmount: 4500, amountPaid: 2000, status: 'Pending', lastPaymentDate: subDays(now, 2) },
        { id: 'LAY004', customerName: 'Ian Malcolm', productName: 'Soft Sole Leather Baby Shoes', totalAmount: 2200, amountPaid: 1000, status: 'Pending', lastPaymentDate: subDays(now, 4) },
    ];
    
    for (const layaway of layawaysData) {
        await prisma.layaway.upsert({
            where: { id: layaway.id },
            update: {},
            create: layaway
        });
    }

    // --- Payments for Layaways ---
    await prisma.payment.createMany({
        data: [
            // Payments for LAY001
            { layawayId: 'LAY001', amount: 2000, method: 'M-Pesa', date: subDays(now, 14) },
            { layawayId: 'LAY001', amount: 2000, method: 'Cash', date: subDays(now, 7) },
            // Payments for LAY002 (fully paid)
            { layawayId: 'LAY002', amount: 1400, method: 'Card', date: subDays(now, 30) },
            { layawayId: 'LAY002', amount: 1400, method: 'Card', date: subDays(now, 15) },
            // Payments for LAY003
            { layawayId: 'LAY003', amount: 2000, method: 'Cash', date: subDays(now, 2) },
            // Payments for LAY004
            { layawayId: 'LAY004', amount: 1000, method: 'M-Pesa', date: subDays(now, 4) },
        ],
        skipDuplicates: true
    });
    console.log(`Seeded ${layawaysData.length} layaways with payments.`);


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
