/**
 * Database seeding script for development
 * Run with: npx ts-node src/scripts/seed.ts
 */

import dotenv from 'dotenv';
dotenv.config();

import { prisma } from '../database/prisma.js';
import crypto from 'crypto';
import bcrypt from 'bcrypt';
import { OrderStatus, Role } from '@prisma/client';

const USER_COUNT = 50;
const ORDERS_PER_USER = 5;

function slugify(text: string): string {
  return text
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '');
}

async function seed() {
  console.log('🌱 Iniciando carga de datos...\n');

  try {
    // Clear existing data
    console.log('🗑️  Limpiando datos existentes...');
    await prisma.wishlist.deleteMany({});
    await prisma.review.deleteMany({});
    await prisma.payment.deleteMany({});
    await prisma.orderItem.deleteMany({});
    await prisma.order.deleteMany({});
    await prisma.product.deleteMany({});
    await prisma.category.deleteMany({});
    await prisma.user.deleteMany({});
    console.log('✅ Datos eliminados\n');

    // Create categories in Spanish
    console.log('📂 Creando categorías...');
    const categories = await Promise.all([
      prisma.category.create({
        data: { name: 'Electrónica', slug: 'electronics', description: 'Dispositivos electrónicos y tecnología' },
      }),
      prisma.category.create({
        data: { name: 'Accesorios', slug: 'accessories', description: 'Accesorios para celular y computador' },
      }),
      prisma.category.create({
        data: { name: 'Software', slug: 'software', description: 'Programas y productos digitales' },
      }),
      prisma.category.create({
        data: { name: 'Servicios', slug: 'services', description: 'Servicios digitales y suscripciones' },
      }),
    ]);
    console.log(`✅ ${categories.length} categorías creadas\n`);

    // Create products with Spanish names and COP prices
    console.log('🛍️  Creando productos...');

    const productData = [
      { name: 'Laptop Pro 15"', price: 3800000, cat: 0, img: 1, desc: 'Laptop profesional de alto rendimiento con procesador de última generación.' },
      { name: 'Audífonos Inalámbricos Bluetooth', price: 250000, cat: 1, img: 2, desc: 'Audífonos con cancelación de ruido activa y 30 horas de batería.' },
      { name: 'Hub USB-C 7 en 1', price: 89000, cat: 1, img: 3, desc: 'Hub USB-C con HDMI 4K, USB 3.0, lector de tarjetas y carga rápida.' },
      { name: 'Soporte para Teléfono de Escritorio', price: 35000, cat: 1, img: 4, desc: 'Soporte ajustable de aluminio para teléfonos y tablets.' },
      { name: 'Pack x5 Protectores de Pantalla', price: 22000, cat: 1, img: 5, desc: 'Protectores de vidrio templado 9H para celular.' },
      { name: 'Power Bank 20000mAh Carga Rápida', price: 145000, cat: 1, img: 6, desc: 'Batería portátil con carga rápida 22.5W y dos puertos USB.' },
      { name: 'Teclado Mecánico Retroiluminado', price: 380000, cat: 0, img: 7, desc: 'Teclado mecánico TKL con switches Red y retroiluminación RGB.' },
      { name: 'Pad de Escritorio XL 90x40cm', price: 55000, cat: 1, img: 8, desc: 'Mousepad de escritorio extra grande, superficie suave antideslizante.' },
      { name: 'Soporte de Monitor Articulado', price: 185000, cat: 1, img: 9, desc: 'Brazo articulado para monitor de hasta 27" con ajuste de altura.' },
      { name: 'Lámpara de Escritorio LED USB', price: 75000, cat: 0, img: 10, desc: 'Lámpara LED con 3 modos de luz y control táctil de brillo.' },
      { name: 'Organizador de Cables Magnético', price: 28000, cat: 1, img: 11, desc: 'Organizador de cables con clips magnéticos para escritorio.' },
      { name: 'Funda Silicona Premium para Celular', price: 32000, cat: 1, img: 12, desc: 'Funda de silicona líquida compatible con los últimos modelos.' },
      { name: 'Vidrio Templado Cobertura Total', price: 18000, cat: 1, img: 13, desc: 'Protector de pantalla vidrio templado 3D con instalación fácil.' },
      { name: 'Altavoz Bluetooth Portátil Resistente al Agua', price: 195000, cat: 0, img: 14, desc: 'Parlante Bluetooth 5.0 resistente al agua IPX7, 12h de batería.' },
      { name: 'SSD Portátil 1TB USB-C', price: 265000, cat: 0, img: 15, desc: 'Disco sólido externo de alta velocidad (1050 MB/s lectura).' },
      { name: 'Hub USB 3.0 de 7 Puertos', price: 78000, cat: 1, img: 16, desc: 'Concentrador USB 3.0 con 7 puertos y fuente de alimentación.' },
      { name: 'Soporte Plegable para Laptop', price: 95000, cat: 1, img: 17, desc: 'Soporte portátil de aluminio, ajustable en 6 alturas.' },
      { name: 'Cámara de Documentos HD', price: 320000, cat: 0, img: 18, desc: 'Cámara visualizadora de documentos 8MP para presentaciones.' },
      { name: 'Aro de Luz Ring 18" con Trípode', price: 175000, cat: 0, img: 19, desc: 'Aro de luz LED con trípode ajustable y soporte para celular.' },
      { name: 'Cámara Web 1080p Full HD', price: 185000, cat: 0, img: 20, desc: 'Webcam Full HD con micrófono incorporado, ideal para videollamadas.' },
      { name: 'VPN Premium — Suscripción Anual', price: 45000, cat: 3, img: 21, desc: 'VPN con más de 3000 servidores en 60 países, conexiones ilimitadas.' },
      { name: 'Almacenamiento en la Nube Pro 1TB', price: 55000, cat: 3, img: 22, desc: 'Almacenamiento en la nube seguro con sincronización automática.' },
      { name: 'Gestor de Contraseñas — Licencia Anual', price: 38000, cat: 2, img: 23, desc: 'Administrador de contraseñas con cifrado AES-256 y autocompletado.' },
      { name: 'Suite de Edición de Video Pro', price: 490000, cat: 2, img: 24, desc: 'Software profesional de edición de video con efectos y transiciones.' },
      { name: 'Bundle de Diseño Gráfico Completo', price: 350000, cat: 2, img: 25, desc: 'Paquete completo de herramientas de diseño gráfico y fotografía.' },
    ];

    const products = await Promise.all(
      productData.map((p) =>
        prisma.product.create({
          data: {
            name: p.name,
            slug: slugify(p.name),
            description: p.desc,
            price: p.price,
            stock: Math.floor(Math.random() * 100) + 10,
            categoryId: categories[p.cat].id,
            images: [`/products/${p.img}.jpg`],
            isActive: true,
          },
        })
      )
    );
    console.log(`✅ ${products.length} productos creados\n`);

    // Create users
    console.log('👥 Creando usuarios...');

    const testUsers = [
      { email: 'admin@flexicommerce.com', password: 'Admin@12345', firstName: 'Admin', lastName: 'FlexiCommerce', role: Role.ADMIN },
      { email: 'customer@flexicommerce.com', password: 'Customer@12345', firstName: 'Juan', lastName: 'Cliente', role: Role.CUSTOMER },
      { email: 'test@flexicommerce.com', password: 'Test@12345', firstName: 'Test', lastName: 'Usuario', role: Role.CUSTOMER },
    ];

    const hashedTestUsers = await Promise.all(
      testUsers.map(async (user) => ({
        ...user,
        password: await bcrypt.hash(user.password, 10),
      }))
    );

    const createdTestUsers = await Promise.all(
      hashedTestUsers.map((user) => prisma.user.create({ data: user }))
    );

    console.log(`✅ ${createdTestUsers.length} usuarios de prueba creados`);
    console.log('   📧 admin@flexicommerce.com / Admin@12345');
    console.log('   📧 customer@flexicommerce.com / Customer@12345');
    console.log('   📧 test@flexicommerce.com / Test@12345\n');

    const randomUsers = await Promise.all(
      Array.from({ length: USER_COUNT }).map((_, i) =>
        prisma.user.create({
          data: {
            email: `usuario${i + 1}@ejemplo.com`,
            firstName: `Usuario`,
            lastName: `${i + 1}`,
            password: crypto.randomBytes(16).toString('hex'),
            role: i < 2 ? Role.ADMIN : Role.CUSTOMER,
          },
        })
      )
    );

    const users = [...createdTestUsers, ...randomUsers];
    console.log(`✅ ${randomUsers.length} usuarios adicionales creados\n`);

    // Create orders
    console.log('📦 Creando órdenes...');
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
          const quantity = Math.floor(Math.random() * 3) + 1;
          total += Number(product.price) * quantity;
          return {
            productId: product.id,
            quantity,
            price: product.price,
          };
        });

        const status = statuses[Math.floor(Math.random() * statuses.length)];
        const daysAgo = Math.floor(Math.random() * 30);
        const createdAt = new Date();
        createdAt.setDate(createdAt.getDate() - daysAgo);

        await prisma.order.create({
          data: {
            userId: user.id,
            total: Math.round(total),
            status,
            currency: 'COP',
            createdAt,
            items: { create: orderItems },
          },
        });

        orderCount++;
      }
    }
    console.log(`✅ ${orderCount} órdenes creadas\n`);

    console.log('📊 Resumen:');
    console.log(`   Categorías: ${categories.length}`);
    console.log(`   Productos: ${products.length}`);
    console.log(`   Usuarios: ${users.length}`);
    console.log(`   Órdenes: ${orderCount}`);
    console.log(`\n✨ ¡Base de datos lista!\n`);
  } catch (error) {
    console.error('❌ Error en el seed:', error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

seed();
