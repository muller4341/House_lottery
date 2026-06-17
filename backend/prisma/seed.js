/**
 * Seed script: creates the first admin user.
 * Run with: node prisma/seed.js
 *
 * Default credentials:
 *   Email:    admin@lottery.com
 *   Password: Admin@1234
 */

import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  const email = 'admin@lottery.com';
  const existing = await prisma.user.findUnique({ where: { email } });

  if (existing) {
    console.log('✅ Admin user already exists:', email);
    return;
  }

  const hashedPassword = await bcrypt.hash('Admin@1234', 10);

  const admin = await prisma.user.create({
    data: {
      email,
      username: 'admin',
      fullName: 'System Administrator',
      password: hashedPassword,
      role: 'ADMIN',
    },
  });

  console.log('🌱 Admin user created:');
  console.log('   Email:   ', admin.email);
  console.log('   Password: Admin@1234');
  console.log('   Role:    ', admin.role);
}

main()
  .catch((e) => {
    console.error('Seed error:', e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
