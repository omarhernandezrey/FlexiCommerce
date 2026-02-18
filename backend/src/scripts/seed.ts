/**
 * Database seeding script for development
 * Run with: npx ts-node src/scripts/seed.ts
 */

import { prisma } from '../database/prisma.js';
import crypto from 'crypto';
import { OrderStatus, Role } from '@prisma/client';

const USER_COUNT = 50;
const ORDERS_PER_USER = 5;

function slugify(text: string): string {
  return text.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
}

async function seed() {
  console.log('🌱 Starting database seeding...\n');

  try {
    // Clear existing data
    console.log('🗑️  Clearing existing data...');
    await prisma.wishlist.deleteMany({});
    await prisma.review.deleteMany({});
    await prisma.payment.deleteMany({});
    await prisma.orderItem.deleteMany({});
    await prisma.order.deleteMany({});
    await prisma.product.deleteMany({});
    await prisma.category.deleteMany({});
    await prisma.user.deleteMany({});
    console.log('✅ Data cleared\n');

    // Create categories
    console.log('📂 Creating categories...');
    const categories = await Promise.all([
      prisma.category.create({
        data: { name: 'Electronics', slug: 'electronics', description: 'Electronic devices' },
      }),
      prisma.category.create({
        data: { name: 'Accessories', slug: 'accessories', description: 'Phone and computer accessories' },
      }),
      prisma.category.create({
        data: { name: 'Software', slug: 'software', description: 'Software and digital products' },
      }),
      prisma.category.create({
        data: { name: 'Services', slug: 'services', description: 'Digital services' },
      }),
    ]);
    console.log(`✅ Created ${categories.length} categories\n`);

    // Create products
    console.log('🛍️  Creating products...');
    const productNames = [
      'Laptop Pro 15',
      'Wireless Headphones',
      'USB-C Hub',
      'Phone Stand',
      'Screen Protector Pack',
      'Power Bank 20000mAh',
      'Mechanical Keyboard',
      'Mouse Pad XL',
      'Monitor Arm',
      'Desk Lamp',
      'Cable Organizer',
      'Phone Case',
      'Tempered Glass Screen',
      'Bluetooth Speaker',
      'Portable SSD 1TB',
      'USB Hub 7-Port',
      'Laptop Stand',
      'Document Camera',
      'Ring Light',
      'Webcam HD',
      'VPN Subscription',
      'Cloud Storage Pro',
      'Password Manager',
      'Video Editing Suite',
      'Design Software Bundle',
    ];

    const products = await Promise.all(
      productNames.map((name, idx) =>
        prisma.product.create({
          data: {
            name,
            slug: slugify(name),
            description: `High-quality ${name.toLowerCase()}. Perfect for professionals and casual users.`,
            price: Math.round((Math.random() * 500 + 20) * 100) / 100,
            stock: Math.floor(Math.random() * 100) + 10,
            categoryId: categories[idx % categories.length].id,
            images: [`/products/${idx + 1}.jpg`],
            isActive: true,
          },
        })
      )
    );
    console.log(`✅ Created ${products.length} products\n`);

    // Create users
    console.log('👥 Creating users...');
    const users = await Promise.all(
      Array.from({ length: USER_COUNT }).map((_, i) =>
        prisma.user.create({
          data: {
            email: `user${i + 1}@example.com`,
            firstName: `User`,
            lastName: `${i + 1}`,
            password: crypto.randomBytes(16).toString('hex'),
            role: i < 3 ? Role.ADMIN : Role.CUSTOMER,
          },
        })
      )
    );
    console.log(`✅ Created ${users.length} users\n`);

    // Create orders
    console.log('📦 Creating orders...');
    let orderCount = 0;

    const statuses = [OrderStatus.PENDING, OrderStatus.PROCESSING, OrderStatus.SHIPPED, OrderStatus.DELIVERED];

    for (const user of users) {
      const ordersToCreate = Math.floor(Math.random() * ORDERS_PER_USER) + 1;

      for (let i = 0; i < ordersToCreate; i++) {
        const itemCount = Math.floor(Math.random() * 5) + 1;
        const selectedProducts = products
          .sort(() => 0.5 - Math.random())
          .slice(0, itemCount);

        let total = 0;
        const orderItems = selectedProducts.map((product) => {
          const quantity = Math.floor(Math.random() * 5) + 1;
          total += Number(product.price) * quantity;
          return {
            productId: product.id,
            quantity,
            price: product.price,
          };
        });

        const status = statuses[Math.floor(Math.random() * statuses.length)];

        // Random dates in the last month
        const daysAgo = Math.floor(Math.random() * 30);
        const createdAt = new Date();
        createdAt.setDate(createdAt.getDate() - daysAgo);

        await prisma.order.create({
          data: {
            userId: user.id,
            total: Math.round(total * 100) / 100,
            status,
            createdAt,
            items: {
              create: orderItems,
            },
          },
        });

        orderCount++;
      }
    }
    console.log(`✅ Created ${orderCount} orders\n`);

    // Summary
    console.log('📊 Seeding Summary:');
    console.log(`   Categories: ${categories.length}`);
    console.log(`   Products: ${products.length}`);
    console.log(`   Users: ${users.length}`);
    console.log(`   Orders: ${orderCount}`);
    console.log(`\n✨ Database seeding completed successfully!\n`);
  } catch (error) {
    console.error('❌ Seeding failed:', error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

seed();
