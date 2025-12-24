
import cron from 'node-cron';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// PRODUCTION MODE: Runs every day at 00:01 AM East Africa Time (UTC+3)
cron.schedule('1 0 * * *', async () => {
  // cron.schedule('*/1 * * * *', async () => {
  console.log('🕐 Running daily assignment COPY job (PRODUCTION MODE)...');

  try {
    // Get today and yesterday in East Africa Time (UTC+3)
    const now = new Date();
    const offset = 3 * 60; // UTC+3 in minutes
    const today = new Date(now.getTime() + offset * 60 * 1000);
    today.setUTCHours(0, 0, 0, 0); // Start of today

    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1); // Start of yesterday

    console.log(`Copying assignments from ${yesterday.toISOString().split('T')[0]} to ${today.toISOString().split('T')[0]}`);

    // Find all assignments from yesterday
    const yesterdayAssignments = await prisma.assignment.findMany({
      where: {
        date: {
          gte: yesterday,
          lt: today,
        },
      },
    });

    if (yesterdayAssignments.length === 0) {
      console.log('No assignments found for yesterday — nothing to copy.');
      return;
    }

    console.log(`Found ${yesterdayAssignments.length} assignment(s) to copy.`);

    // Create new assignments for today
    const createPromises = yesterdayAssignments.map((assignment) => {
      return prisma.assignment.create({
        data: {
          date: today,
          branchIds: assignment.branchIds,
          branchNames: assignment.branchNames,
          accountOfficerEmployeeIds: assignment.accountOfficerEmployeeIds,
          branchId: assignment.branchIds.split(',')[0]?.trim() || '',
          branchName: assignment.branchNames.split(', ')[0]?.trim() || '',
          accountOfficerEmployeeId: assignment.accountOfficerEmployeeIds.split(',')[0]?.trim() || '',
          officer1Id: assignment.officer1Id,
          officer1Shift: assignment.officer1Shift,
          officer1Phone: assignment.officer1Phone,
          officer2Id: assignment.officer2Id,
          officer2Shift: assignment.officer2Shift,
          officer2Phone: assignment.officer2Phone,
          tl1Id: assignment.tl1Id,
          tl1Shift: assignment.tl1Shift,
          tl1Phone: assignment.tl1Phone,
          tl2Id: assignment.tl2Id,
          tl2Shift: assignment.tl2Shift,
          tl2Phone: assignment.tl2Phone,
        },
      });
    });

    await Promise.all(createPromises);

    console.log(`✅ Successfully copied ${yesterdayAssignments.length} assignments to today (${today.toISOString().split('T')[0]})!`);
  } catch (error) {
    console.error('❌ Error in daily assignment copy job:', error);
  } finally {
    await prisma.$disconnect();
  }
}, {
  scheduled: true,
  timezone: 'Africa/Nairobi' // East Africa Time — Kenya/Ethiopia
});

export default () => {
  console.log('PRODUCTION MODE: Daily assignment copy job scheduled for 00:01 AM EAT');
};