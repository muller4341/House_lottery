import { PrismaClient } from '@prisma/client';
import * as XLSX from 'xlsx';
import ExcelJS from 'exceljs';
import crypto from 'crypto';

const prisma = new PrismaClient();

// Helper: Generate UUID for lottery run
const generateLotteryRunId = () => crypto.randomUUID();

// Helper: Fisher-Yates shuffle (unbiased)
const shuffleArray = (arr) => {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = crypto.randomInt(0, i + 1);
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
};

// ====================== DASHBOARD ======================
export const getDashboardStats = async (req, res) => {
  try {
    const [
      totalHouses,
      availableHouses,
      totalApplicants,
      winners,
      waitlisted,
      lastLottery,
    ] = await Promise.all([
      prisma.house.count(),
      prisma.house.count({ where: { status: 'NONE' } }),
      prisma.applicant.count(),
      prisma.applicant.count({ where: { status: 'WINNER' } }),
      prisma.applicant.count({ where: { status: 'WAITLIST' } }),
      prisma.lotteryResult.findFirst({
        orderBy: { drawDate: 'desc' },
        select: { drawDate: true },
      }),
    ]);

    res.json({
      totalHouses,
      availableHouses,
      totalApplicants,
      winners,
      waitlisted,
      pendingApplicants: totalApplicants - winners - waitlisted,
      lastLotteryDate: lastLottery?.drawDate || null,
    });
  } catch (error) {
    console.error('Dashboard error:', error);
    res.status(500).json({ error: 'Failed to fetch dashboard stats' });
  }
};

// ====================== HOUSES ======================
export const getHouses = async (req, res) => {
  try {
    const { site, area, status } = req.query;
    const where = {};

    if (site) where.site = { contains: site, mode: 'insensitive' };
    if (area) where.area = { contains: area, mode: 'insensitive' };
    if (status) where.status = status.toUpperCase();

    const houses = await prisma.house.findMany({
      where,
      orderBy: { houseNumber: 'asc' },
    });

    res.json(houses);
  } catch (error) {
    console.error('GetHouses error:', error);
    res.status(500).json({ error: 'Failed to fetch houses' });
  }
};

export const uploadHouses = async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ error: 'No file uploaded' });

    const workbook = XLSX.readFile(req.file.path);
    const sheet = workbook.Sheets[workbook.SheetNames[0]];
    const data = XLSX.utils.sheet_to_json(sheet);

    if (data.length === 0) {
      return res.status(400).json({ error: 'Excel file is empty' });
    }

    const housesToCreate = data
      .map((row) => ({
        houseNumber: String(
          row.houseNumber || row['House Number'] || row.house_number || ''
        ).trim(),
        site: String(row.site || row.Site || '').trim(),
        area: String(row.area || row.Area || '').trim(),
        floor: parseInt(row.floor || row.Floor || row.floorNumber || 0),
      }))
      .filter((h) => h.houseNumber && h.site && h.area && !isNaN(h.floor));

    if (housesToCreate.length === 0) {
      return res.status(400).json({ error: 'No valid rows found. Check column names: houseNumber, site, area, floor' });
    }

    let upserted = 0;
    await prisma.$transaction(async (tx) => {
      for (const house of housesToCreate) {
        await tx.house.upsert({
          where: { houseNumber: house.houseNumber },
          update: { site: house.site, area: house.area, floor: house.floor },
          create: house,
        });
        upserted++;
      }
    });

    res.json({ message: `Successfully uploaded ${upserted} houses` });
  } catch (error) {
    console.error('UploadHouses error:', error);
    res.status(500).json({ error: 'Failed to upload houses' });
  }
};

// ====================== APPLICANTS ======================
export const getApplicants = async (req, res) => {
  try {
    const { site, area, status } = req.query;
    const where = {};

    if (site) where.site = { contains: site, mode: 'insensitive' };
    if (area) where.area = { contains: area, mode: 'insensitive' };
    if (status) where.status = status.toUpperCase();

    const applicants = await prisma.applicant.findMany({
      where,
      orderBy: { username: 'asc' },
    });

    res.json(applicants);
  } catch (error) {
    console.error('GetApplicants error:', error);
    res.status(500).json({ error: 'Failed to fetch applicants' });
  }
};

export const uploadApplicants = async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ error: 'No file uploaded' });

    const workbook = XLSX.readFile(req.file.path);
    const sheet = workbook.Sheets[workbook.SheetNames[0]];
    const data = XLSX.utils.sheet_to_json(sheet);

    if (data.length === 0) {
      return res.status(400).json({ error: 'Excel file is empty' });
    }

    const applicantsToCreate = data
      .map((row) => ({
        username: String(
          row.username || row.name || row.fullName || row['Full Name'] || ''
        ).trim(),
        site: String(row.site || row.Site || '').trim(),
        area: String(row.area || row.Area || '').trim(),
      }))
      .filter((a) => a.username && a.site && a.area);

    if (applicantsToCreate.length === 0) {
      return res.status(400).json({ error: 'No valid rows found. Check column names: username, site, area' });
    }

    const result = await prisma.applicant.createMany({
      data: applicantsToCreate,
      skipDuplicates: true,
    });

    res.json({ message: `Successfully uploaded ${result.count} applicants` });
  } catch (error) {
    console.error('UploadApplicants error:', error);
    res.status(500).json({ error: 'Failed to upload applicants' });
  }
};

// ====================== LOTTERY LOGIC ======================
export const runLottery = async (req, res) => {
  try {
    const lotteryRunId = generateLotteryRunId();

    // Get all available houses grouped by (site, area)
    const houses = await prisma.house.findMany({
      where: { status: 'NONE' },
      orderBy: { houseNumber: 'asc' },
    });

    if (houses.length === 0) {
      return res.status(400).json({ error: 'No available houses with status NONE' });
    }

    // Group houses by site|area key
    const groupedHouses = {};
    houses.forEach((house) => {
      const key = `${house.site}|${house.area}`;
      if (!groupedHouses[key]) groupedHouses[key] = [];
      groupedHouses[key].push(house);
    });

    const results = [];
    const applicantUpdates = [];
    const houseUpdates = [];

    for (const [key, houseList] of Object.entries(groupedHouses)) {
      const [site, area] = key.split('|');

      const eligibleApplicants = await prisma.applicant.findMany({
        where: { site, area, status: 'NONE' },
        orderBy: { username: 'asc' },
      });

      if (eligibleApplicants.length === 0) continue;

      // Unbiased Fisher-Yates shuffle
      const shuffled = shuffleArray(eligibleApplicants);
      const numWinners = Math.min(houseList.length, shuffled.length);

      // Winners — get a house
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

        applicantUpdates.push({ id: applicant.id, status: 'WINNER' });
        houseUpdates.push(house.id);
      }

      // Waitlist — eligible but no house available
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

        applicantUpdates.push({ id: applicant.id, status: 'WAITLIST' });
      }
    }

    if (results.length === 0) {
      return res.status(400).json({ error: 'No eligible applicants found for available houses' });
    }

    // Execute all updates in a transaction
    await prisma.$transaction(async (tx) => {
      await tx.lotteryResult.createMany({ data: results });

      for (const { id, status } of applicantUpdates) {
        await tx.applicant.update({ where: { id }, data: { status } });
      }

      for (const houseId of houseUpdates) {
        await tx.house.update({ where: { id: houseId }, data: { status: 'PROVIDED' } });
      }
    });

    res.json({
      message: 'Lottery completed successfully',
      lotteryRunId,
      totalWinners: results.filter((r) => r.status === 'WINNER').length,
      totalWaitlisted: results.filter((r) => r.status === 'WAITLIST').length,
    });
  } catch (error) {
    console.error('RunLottery error:', error);
    res.status(500).json({ error: 'Lottery execution failed' });
  }
};

// ====================== RESULTS ======================
export const getLotteryResults = async (req, res) => {
  try {
    const { runId } = req.params;
    const results = await prisma.lotteryResult.findMany({
      where: { lotteryRunId: runId },
      orderBy: [{ status: 'asc' }, { username: 'asc' }], // WAITLIST < WINNER alphabetically
    });
    // Sort so WINNER comes first
    results.sort((a, b) => {
      if (a.status === 'WINNER' && b.status !== 'WINNER') return -1;
      if (a.status !== 'WINNER' && b.status === 'WINNER') return 1;
      return a.username.localeCompare(b.username);
    });
    res.json(results);
  } catch (error) {
    console.error('GetResults error:', error);
    res.status(500).json({ error: 'Failed to fetch results' });
  }
};

export const getLotteryHistory = async (req, res) => {
  try {
    const history = await prisma.lotteryResult.groupBy({
      by: ['lotteryRunId', 'drawDate'],
      _count: { id: true },
      orderBy: { drawDate: 'desc' },
    });

    // Enrich with winner/waitlist breakdown
    const enriched = await Promise.all(
      history.map(async (item) => {
        const [winners, waitlisted] = await Promise.all([
          prisma.lotteryResult.count({
            where: { lotteryRunId: item.lotteryRunId, status: 'WINNER' },
          }),
          prisma.lotteryResult.count({
            where: { lotteryRunId: item.lotteryRunId, status: 'WAITLIST' },
          }),
        ]);
        return {
          lotteryRunId: item.lotteryRunId,
          drawDate: item.drawDate,
          totalParticipants: item._count.id,
          winners,
          waitlisted,
        };
      })
    );

    res.json(enriched);
  } catch (error) {
    console.error('GetHistory error:', error);
    res.status(500).json({ error: 'Failed to fetch history' });
  }
};

export const downloadResultsExcel = async (req, res) => {
  try {
    const { runId } = req.params;
    const results = await prisma.lotteryResult.findMany({
      where: { lotteryRunId: runId },
      orderBy: [{ status: 'asc' }, { username: 'asc' }],
    });

    results.sort((a, b) => {
      if (a.status === 'WINNER' && b.status !== 'WINNER') return -1;
      if (a.status !== 'WINNER' && b.status === 'WINNER') return 1;
      return a.username.localeCompare(b.username);
    });

    if (results.length === 0) {
      return res.status(404).json({ error: 'No results found for this run' });
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

    // Style header row
    worksheet.getRow(1).font = { bold: true };
    worksheet.getRow(1).fill = {
      type: 'pattern',
      pattern: 'solid',
      fgColor: { argb: 'FF1E3A5F' },
    };
    worksheet.getRow(1).font = { bold: true, color: { argb: 'FFFFFFFF' } };

    results.forEach((r) => {
      const row = worksheet.addRow({
        username: r.username,
        site: r.site,
        area: r.area,
        houseNumber: r.houseNumber || '-',
        floor: r.floor ?? '-',
        status: r.status,
        drawDate: r.drawDate.toISOString().split('T')[0],
      });

      const statusCell = row.getCell('status');
      if (r.status === 'WINNER') {
        statusCell.fill = {
          type: 'pattern',
          pattern: 'solid',
          fgColor: { argb: 'FFD4EDDA' },
        };
        statusCell.font = { color: { argb: 'FF155724' }, bold: true };
      } else {
        statusCell.fill = {
          type: 'pattern',
          pattern: 'solid',
          fgColor: { argb: 'FFFFF3CD' },
        };
        statusCell.font = { color: { argb: 'FF856404' }, bold: true };
      }
    });

    res.setHeader(
      'Content-Type',
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
    );
    res.setHeader(
      'Content-Disposition',
      `attachment; filename=Lottery_Results_${runId.slice(0, 8)}.xlsx`
    );

    await workbook.xlsx.write(res);
    res.end();
  } catch (error) {
    console.error('DownloadExcel error:', error);
    res.status(500).json({ error: 'Failed to generate Excel file' });
  }
};