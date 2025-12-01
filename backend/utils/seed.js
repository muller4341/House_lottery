// utils/seed.js
import { prisma } from './prismaClient.js'

export async function seedUsers() {
  const usersData = [
    { employeeId: '070876', name: 'Abebe Kebede', role: 'ACCOUNT_OFFICER', phone: '0912345678' },
    { employeeId: '070877', name: 'Tilahun Alemu', role: 'ACCOUNT_OFFICER', phone: '0912345679' },
    { employeeId: '070878', name: 'Meron Yohannes', role: 'OFFICER', phone: '0912345680' },
    { employeeId: '070879', name: 'Dawit Mengistu', role: 'OFFICER', phone: '0912345681' },
    { employeeId: '070880', name: 'Helen Getachew', role: 'TEAM_LEADER', phone: '0912345682' },
    { employeeId: '070881', name: 'Sara Tesfaye', role: 'TEAM_LEADER', phone: '0912345683' },
    { employeeId: '070875', name: 'Muluken Walle Hibste', role: 'CENTRAL_KYC_MANAGER', phone: null }
  ];

  for (const userData of usersData) {
    await prisma.user.upsert({
      where: { employeeId: userData.employeeId },
      update: {},
      create: userData
    });
  }
  console.log('Users seeded successfully.');
}