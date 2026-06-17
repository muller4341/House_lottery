const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
const xlsx = require('xlsx');
const ExcelJS = require('exceljs');
const crypto = require('crypto');

// Helper: Generate UUID for lottery run
const generateLotteryRunId = () => crypto.randomUUID();

// ====================== DASHBOARD ======================
const getDashboardStats = async (req, res) => {
  try {
    const [
      totalHouses,
      availableHouses,
      totalApplicants,
      winners,
      waitlisted,
      lastLottery
    ] = await Promise.all([
      prisma.house.count(),
      prisma.house.count({ where: { status: 'NONE' } }),
      prisma.applicant.count(),
      prisma.applicant.count({ where: { status: 'WINNER' } }),
      prisma.applicant.count({ where: { status: 'WAITLIST' } }),
      prisma.lotteryResult.findFirst({
        orderBy: { drawDate: 'desc' },
        select: { drawDate: true }
      })
    ]);

    res.json({
      totalHouses,
      availableHouses,
      totalApplicants,
      winners,
      waitlisted,
      lastLotteryDate: lastLottery?.drawDate || null,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to fetch dashboard stats' });
  }
};

// ====================== HOUSES ======================
const getHouses = async (req, res) => {
  try {
    const { site, area, status } = req.query;
    const where = {};

    if (site) where.site = site;
    if (area) where.area = area;
    if (status) where.status = status.toUpperCase();

    const houses = await prisma.house.findMany({
      where,
      orderBy: { houseNumber: 'asc' }
    });

    res.json(houses);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch houses' });
  }
};

const uploadHouses = async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ error: 'No file uploaded' });

    const workbook = xlsx.readFile(req.file.path);
    const sheet = workbook.Sheets[workbook.SheetNames[0]];
    const data = xlsx.utils.sheet_to_json(sheet);

    if (data.length === 0) {
      return res.status(400).json({ error: 'Excel file is empty' });
    }

    const housesToCreate = data.map(row => ({
      houseNumber: String(row.houseNumber || row['House Number'] || row.house_number).trim(),
      site: String(row.site || row.Site).trim(),
      area: String(row.area || row.Area).trim(),
      floor: parseInt(row.floor || row.Floor || row.floorNumber),
    })).filter(h => h.houseNumber && h.site && h.area);

    await prisma.$transaction(async (tx) => {
      for (const house of housesToCreate) {
        await tx.house.upsert({
          where: { houseNumber: house.houseNumber },
          update: {
            site: house.site,
            area: house.area,
            floor: house.floor,
          },
          create: house,
        });
      }
    });

    res.json({ message: `Successfully uploaded ${housesToCreate.length} houses` });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to upload houses' });
  }
};

// ====================== APPLICANTS ======================
const getApplicants = async (req, res) => {
  try {
    const { site, area, status } = req.query;
    const where = {};

    if (site) where.site = site;
    if (area) where.area = area;
    if (status) where.status = status.toUpperCase();

    const applicants = await prisma.applicant.findMany({
      where,
      orderBy: { username: 'asc' }
    });

    res.json(applicants);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch applicants' });
  }
};

const uploadApplicants = async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ error: 'No file uploaded' });

    const workbook = xlsx.readFile(req.file.path);
    const sheet = workbook.Sheets[workbook.SheetNames[0]];
    const data = xlsx.utils.sheet_to_json(sheet);

    const applicantsToCreate = data.map(row => ({
      username: String(row.username || row.name || row.fullName || row['Full Name']).trim(),
      site: String(row.site || row.Site).trim(),
      area: String(row.area || row.Area).trim(),
    })).filter(a => a.username && a.site && a.area);

    await prisma.applicant.createMany({
      data: applicantsToCreate,
      skipDuplicates: true,
    });

    res.json({ message: `Successfully uploaded ${applicantsToCreate.length} applicants` });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to upload applicants' });
  }
};

// ====================== LOTTERY LOGIC ======================
const runLottery = async (req, res) => {
  try {
    const lotteryRunId = generateLotteryRunId();

    // Get all available houses grouped by (site, area)
    const houses = await prisma.house.findMany({
      where: { status: 'NONE' },
      orderBy: { houseNumber: 'asc' }
    });

    const groupedHouses = {};
    houses.forEach(house => {
      const key = `${house.site}|${house.area}`;
      if (!groupedHouses[key]) groupedHouses[key] = [];
      groupedHouses[key].push(house);
    });

    const results = [];
    const updates = [];

    for (const [key, houseList] of Object.entries(groupedHouses)) {
      const [site, area] = key.split('|');

      const eligibleApplicants = await prisma.applicant.findMany({
        where: { site, area, status: 'NONE' },
        orderBy: { username: 'asc' }
      });

      if (eligibleApplicants.length === 0) continue;

      // Shuffle applicants fairly
      const shuffled = [...eligibleApplicants].sort(() => crypto.randomInt(2) - 0.5);

      const numWinners = Math.min(houseList.length, shuffled.length);

      // Winners
      for (let i = 0; i < numWinners; i++) {
        const applicant = shuffled[i];
        const house = houseList[i];

        results.push({
          lotteryRunId,
          username: applicant.username,
          site,
          area,
          floor: house.floor,
          houseNumber: house.houseNumber,
          status: 'WINNER',
          houseId: house.id,
          applicantId: applicant.id,
        });

        updates.push({
          applicantId: applicant.id,
          houseId: house.id,
          status: 'WINNER'
        });
      }

      // Waitlist
      for (let i = numWinners; i < shuffled.length; i++) {
        const applicant = shuffled[i];
        results.push({
          lotteryRunId,
          username: applicant.username,
          site,
          area,
          floor: null,
          houseNumber: null,
          status: 'WAITLIST',
          houseId: null,
          applicantId: applicant.id,
        });

        updates.push({
          applicantId: applicant.id,
          houseId: null,
          status: 'WAITLIST'
        });
      }
    }

    if (results.length === 0) {
      return res.status(400).json({ error: 'No eligible applicants or houses found' });
    }

    // Execute all updates in transaction
    await prisma.$transaction(async (tx) => {
      // Create results
      await tx.lotteryResult.createMany({ data: results });

      // Update applicants
      for (const u of updates.filter(u => u.status === 'WINNER')) {
        await tx.applicant.update({
          where: { id: u.applicantId },
          data: { status: 'WINNER' }
        });
      }
      for (const u of updates.filter(u => u.status === 'WAITLIST')) {
        await tx.applicant.update({
          where: { id: u.applicantId },
          data: { status: 'WAITLIST' }
        });
      }

      // Update houses
      for (const u of updates.filter(u => u.houseId)) {
        await tx.house.update({
          where: { id: u.houseId },
          data: { status: 'PROVIDED' }
        });
      }
    });

    res.json({
      message: 'Lottery completed successfully',
      lotteryRunId,
      totalWinners: results.filter(r => r.status === 'WINNER').length,
      totalWaitlisted: results.filter(r => r.status === 'WAITLIST').length
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Lottery execution failed' });
  }
};

// ====================== RESULTS ======================
const getLotteryResults = async (req, res) => {
  try {
    const { runId } = req.params;
    const results = await prisma.lotteryResult.findMany({
      where: { lotteryRunId: runId },
      orderBy: [
        { status: 'desc' }, // WINNER first
        { username: 'asc' }
      ]
    });
    res.json(results);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch results' });
  }
};

const getLotteryHistory = async (req, res) => {
  try {
    const history = await prisma.lotteryResult.groupBy({
      by: ['lotteryRunId', 'drawDate'],
      _count: { id: true },
      orderBy: { drawDate: 'desc' }
    });

    res.json(history);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch history' });
  }
};

const downloadResultsExcel = async (req, res) => {
  try {
    const { runId } = req.params;
    const results = await prisma.lotteryResult.findMany({
      where: { lotteryRunId: runId },
      orderBy: [{ status: 'desc' }, { username: 'asc' }]
    });

    if (results.length === 0) {
      return res.status(404).json({ error: 'No results found' });
    }

    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet('Lottery Results');

    worksheet.columns = [
      { header: 'Username', key: 'username', width: 30 },
      { header: 'Site', key: 'site', width: 15 },
      { header: 'Area', key: 'area', width: 15 },
      { header: 'House Number', key: 'houseNumber', width: 15 },
      { header: 'Floor', key: 'floor', width: 10 },
      { header: 'Status', key: 'status', width: 12 },
      { header: 'Draw Date', key: 'drawDate', width: 20 },
    ];

    worksheet.addRows(results.map(r => ({
      ...r,
      drawDate: r.drawDate.toISOString().split('T')[0]
    })));

    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
    res.setHeader('Content-Disposition', `attachment; filename=Lottery_Results_${runId}.xlsx`);

    await workbook.xlsx.write(res);
    res.end();
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to download Excel' });
  }
};

module.exports = {
  getDashboardStats,
  getHouses,
  uploadHouses,
  getApplicants,
  uploadApplicants,
  runLottery,
  getLotteryResults,
  getLotteryHistory,
  downloadResultsExcel,
};