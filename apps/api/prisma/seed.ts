import { PrismaClient, TableStatus } from '../src/generated/prisma/client';
import { PrismaBetterSqlite3 } from '@prisma/adapter-better-sqlite3';
import * as path from 'path';

const dbPath = path.resolve(__dirname, './dev.db');
const adapter = new PrismaBetterSqlite3({ url: `file:${dbPath}` });
const prisma = new PrismaClient({ adapter });

async function main() {
  console.log('🌱 Seeding database...');

  const categories = await Promise.all([
    prisma.category.upsert({ where: { name: 'อาหารจานหลัก' }, update: {}, create: { name: 'อาหารจานหลัก', icon: '🍛', sortOrder: 1 } }),
    prisma.category.upsert({ where: { name: 'เครื่องดื่ม' }, update: {}, create: { name: 'เครื่องดื่ม', icon: '🥤', sortOrder: 2 } }),
    prisma.category.upsert({ where: { name: 'ของทานเล่น' }, update: {}, create: { name: 'ของทานเล่น', icon: '🍟', sortOrder: 3 } }),
    prisma.category.upsert({ where: { name: 'ของหวาน' }, update: {}, create: { name: 'ของหวาน', icon: '🍰', sortOrder: 4 } }),
  ]);

  await Promise.all([
    prisma.product.create({ data: { name: 'ข้าวผัดกุ้ง', price: 85, categoryId: categories[0].id, sortOrder: 1 } }),
    prisma.product.create({ data: { name: 'ผัดกระเพราหมูสับ', price: 75, categoryId: categories[0].id, sortOrder: 2 } }),
    prisma.product.create({ data: { name: 'ต้มยำกุ้ง', price: 150, categoryId: categories[0].id, sortOrder: 3 } }),
    prisma.product.create({ data: { name: 'ผัดไทยกุ้งสด', price: 95, categoryId: categories[0].id, sortOrder: 4 } }),
    prisma.product.create({ data: { name: 'ชาเย็น', price: 35, categoryId: categories[1].id, sortOrder: 1 } }),
    prisma.product.create({ data: { name: 'กาแฟเย็น', price: 40, categoryId: categories[1].id, sortOrder: 2 } }),
    prisma.product.create({ data: { name: 'น้ำเปล่า', price: 15, categoryId: categories[1].id, sortOrder: 3 } }),
    prisma.product.create({ data: { name: 'โค้ก/เป๊ปซี่', price: 25, categoryId: categories[1].id, sortOrder: 4 } }),
    prisma.product.create({ data: { name: 'ปอเปี๊ยะทอด', price: 60, categoryId: categories[2].id, sortOrder: 1 } }),
    prisma.product.create({ data: { name: 'ไก่ทอด (3 ชิ้น)', price: 80, categoryId: categories[2].id, sortOrder: 2 } }),
    prisma.product.create({ data: { name: 'ไอศกรีมกะทิ', price: 45, categoryId: categories[3].id, sortOrder: 1 } }),
    prisma.product.create({ data: { name: 'ข้าวเหนียวมะม่วง', price: 65, categoryId: categories[3].id, sortOrder: 2 } }),
  ]);

  for (let i = 1; i <= 10; i++) {
    await prisma.table.upsert({
      where: { number: i },
      update: {},
      create: { number: i, name: `โต๊ะ ${i}`, capacity: i <= 6 ? 4 : 6, status: TableStatus.AVAILABLE },
    });
  }

  console.log('✅ Seed complete!');
}

main()
  .catch((e) => { console.error(e); process.exit(1); })
  .finally(async () => { await (prisma as any).$disconnect(); });
