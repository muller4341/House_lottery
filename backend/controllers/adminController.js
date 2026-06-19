import { PrismaClient } from '@prisma/client';
import XLSX from 'xlsx';
import ExcelJS from 'exceljs';
import crypto from 'crypto';
import { v4 as uuidv4 } from 'uuid';

const { readFile, utils } = XLSX;
const prisma = new PrismaClient();

// Helper: Generate UUID for lottery run
const generateLotteryRunId = () => crypto.randomUUID();

// Helper: Fisher-Yates shuffle (unbiased)
// const shuffleArray = (arr) => {
//   const a = [...arr];
//   for (let i = a.length - 1; i > 0; i--) {
//     const j = crypto.randomInt(0, i + 1);
//     [a[i], a[j]] = [a[j], a[i]];
//   }
//   return a;
// };

// Secure Fisher-Yates shuffle engine to randomize candidates fairly
const shuffleArray = (array) => {
  const shuffled = [...array];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
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
      .map((row) => {
        // Parse floor dynamically (handles strings, negative numbers like -2, etc.)
        const rawFloor = row.floor ?? row.Floor ?? row['Floor'] ?? 0;
        
        // Parse bedroom safely
        const rawBedroom = row.bedroom ?? row.Bedroom ?? row['Bed room'] ?? 0;

        return {
          houseNumber: String(
            row.houseNumber || row['House number'] || row.house_number || ''
          ).trim(),
          block: String(row.block || row.Block || '').trim() || null,
          bedroom: parseInt(rawBedroom) || 0,
          site: String(row.site || row.Site || '').trim(),
          area: String(row.area || row.Area || '').trim(),
          floor: parseInt(rawFloor),
        };
      })
      // Validate that mandatory data exists (houseNumber, site, area must not be blank)
      .filter((h) => h.houseNumber && h.site && h.area && !isNaN(h.floor));

    if (housesToCreate.length === 0) {
      return res.status(400).json({ 
        error: 'No valid rows found. Please ensure your Excel file matches headers: Block, House number, Floor, Bed room, Area, Site' 
      });
    }

    let upserted = 0;
    await prisma.$transaction(async (tx) => {
      for (const house of housesToCreate) {
        await tx.house.upsert({
          where: { houseNumber: house.houseNumber },
          update: { 
            block: house.block,
            bedroom: house.bedroom,
            site: house.site, 
            area: house.area, 
            floor: house.floor 
          },
          create: house,
        });
        upserted++;
      }
    });

    res.json({ message: `Successfully uploaded ${upserted} houses matching your layout.` });
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
      .map((row) => {
        // Safely capture "Bed room", "bedroom", or "Bedroom" columns
        const rawBedroom = row['Bed room'] || row.bedroom || row.Bedroom || 0;

        return {
          idCode: String(row.id || row.Id || row.idCode || '').trim() || null,
          username: String(
            row.Name || row.name || row.username || row['Full Name'] || ''
          ).trim(),
          bedroom: parseInt(rawBedroom) || 0, // 💡 PARSES BEDROOM NUMBER AS INTEGER
          site: String(row.Site || row.site || '').trim(),
          area: String(row.Area || row.area || '').trim(),
        };
      })
      .filter((a) => a.username && a.site && a.area);

    if (applicantsToCreate.length === 0) {
      return res.status(400).json({ 
        error: 'No valid rows found. Please ensure your columns match headers exactly: Id, Name, Bed room, Area, Site' 
      });
    }

    let uploadedCount = 0;
    await prisma.$transaction(async (tx) => {
      for (const applicant of applicantsToCreate) {
        if (applicant.idCode) {
          await tx.applicant.upsert({
            where: { idCode: applicant.idCode },
            update: { 
              username: applicant.username, 
              bedroom: applicant.bedroom, // Updates bedroom configuration on existing users
              site: applicant.site, 
              area: applicant.area 
            },
            create: applicant,
          });
        } else {
          await tx.applicant.create({ data: applicant });
        }
        uploadedCount++;
      }
    });

    res.json({ message: `Successfully uploaded ${uploadedCount} applicants with bedroom data.` });
  } catch (error) {
    console.error('UploadApplicants error:', error);
    res.status(500).json({ error: 'Failed to upload applicants' });
  }
};


// export const runLottery = async (req, res) => {
//   try {
//     const lotteryRunId = uuidv4();

//     // 1. Fetch all available houses (status = NONE)
//     const houses = await prisma.house.findMany({
//       where: { status: 'NONE' },
//       orderBy: { houseNumber: 'asc' },
//     });

//     if (houses.length === 0) {
//       return res.status(400).json({ error: 'No available houses with status NONE' });
//     }

//     // 2. Group available inventory into categories matching: site | area | bedroom
//     const groupedHouses = {};
//     houses.forEach((house) => {
//       const bedCount = house.bedroom ?? 0;
//       const key = `${house.site}|${house.area}|${bedCount}`;
      
//       if (!groupedHouses[key]) groupedHouses[key] = [];
//       groupedHouses[key].push(house);
//     });

//     const results = [];
//     const applicantUpdates = [];
//     const houseUpdates = [];

//     // 3. Process each category separately
//     for (const [key, houseList] of Object.entries(groupedHouses)) {
//       const [site, area, bedStr] = key.split('|');
//       const bedCount = parseInt(bedStr) || 0;

//       // Find pending candidates who applied for the exact same site, area, AND bedroom count
//       const eligibleApplicants = await prisma.applicant.findMany({
//         where: { 
//           site, 
//           area, 
//           bedroom: bedCount, // Strict bedroom match criteria
//           status: 'NONE' 
//         },
//         orderBy: { username: 'asc' },
//       });

//       if (eligibleApplicants.length === 0) continue;

//       // Randomize the candidate pool
//       const shuffled = shuffleArray(eligibleApplicants);
//       const numWinners = Math.min(houseList.length, shuffled.length);

//       // Assign houses to winners
//       for (let i = 0; i < numWinners; i++) {
//         const applicant = shuffled[i];
//         const house = houseList[i];

//         results.push({
//           lotteryRunId,
//           username: applicant.username,
//           site,
//           area,
//           floor: house.floor,
//           houseNumber: house.houseNumber,
//           status: 'WINNER',
//           houseId: house.id,
//           applicantId: applicant.id,
//         });

//         applicantUpdates.push({ id: applicant.id, status: 'WINNER' });
//         houseUpdates.push(house.id);
//       }

//       // Automatically place remaining candidates on the waitlist for this specific group
//       for (let i = numWinners; i < shuffled.length; i++) {
//         const applicant = shuffled[i];

//         results.push({
//           lotteryRunId,
//           username: applicant.username,
//           site,
//           area,
//           floor: null,
//           houseNumber: null,
//           status: 'WAITLIST',
//           houseId: null,
//           applicantId: applicant.id,
//         });

//         applicantUpdates.push({ id: applicant.id, status: 'WAITLIST' });
//       }
//     }

//     if (results.length === 0) {
//       return res.status(400).json({ error: 'No matching applicants found for any of the available house pools.' });
//     }

//     // 4. Atomic transaction batch write to the database
//     await prisma.$transaction(async (tx) => {
//       await tx.lotteryResult.createMany({ data: results });

//       for (const { id, status } of applicantUpdates) {
//         await tx.applicant.update({ where: { id }, data: { status } });
//       }

//       for (const houseId of houseUpdates) {
//         await tx.house.update({ where: { id: houseId }, data: { status: 'PROVIDED' } });
//       }
//     });

//     res.json({
//       message: 'Lottery completed successfully',
//       lotteryRunId,
//       totalWinners: results.filter((r) => r.status === 'WINNER').length,
//       totalWaitlisted: results.filter((r) => r.status === 'WAITLIST').length,
//     });
//   } catch (error) {
//     console.error('RunLottery error:', error);
//     res.status(500).json({ error: 'Lottery execution engine encountered an error' });
//   }
// };

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

export const runLottery = async (req, res) => {
  try {
    // Read the isolated filter targets directly from the body request
    const { site, area, bedroom } = req.body;

    if (!site || !area || !bedroom) {
      return res.status(400).json({ error: 'Missing baseline criteria specifications payload.' });
    }

    const lotteryRunId = uuidv4();

    // 1. Fetch available houses limited exclusively to the requested parameters
    const houses = await prisma.house.findMany({
      where: { 
        status: 'NONE',
        site: { equals: site, mode: 'insensitive' },
        area: { equals: area, mode: 'insensitive' },
        bedroom: parseInt(bedroom)
      },
      orderBy: { houseNumber: 'asc' },
    });

    if (houses.length === 0) {
      return res.status(400).json({ error: `No available vacant property matching criteria: ${site} | ${area} m² | ${bedroom} BR.` });
    }

    // 2. Query candidates registered for the exact same parameters
    const eligibleApplicants = await prisma.applicant.findMany({
      where: { 
        status: 'NONE',
        site: { equals: site, mode: 'insensitive' },
        area: { equals: area, mode: 'insensitive' },
        bedroom: parseInt(bedroom)
      },
      orderBy: { username: 'asc' },
    });

    if (eligibleApplicants.length === 0) {
      return res.status(400).json({ error: `No matching pending candidates found for: ${site} | ${area} m² | ${bedroom} BR.` });
    }

    // 3. Unbiased Fisher-Yates array pointer shuffle
    const shuffled = [...eligibleApplicants];
    for (let i = shuffled.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }

    const results = [];
    const applicantUpdates = [];
    const houseUpdates = [];
    const numWinners = Math.min(houses.length, shuffled.length);

    // Populate assignment elements
    for (let i = 0; i < numWinners; i++) {
      const applicant = shuffled[i];
      const house = houses[i];

      results.push({
        lotteryRunId,
        username: applicant.username,
        site: house.site,
        area: house.area,
        bedroom: house.bedroom, // Preserved explicitly
        floor: house.floor,
        houseNumber: house.houseNumber,
        status: 'WINNER',
        houseId: house.id,
        applicantId: applicant.id,
      });

      applicantUpdates.push({ id: applicant.id, status: 'WINNER' });
      houseUpdates.push(house.id);
    }

    // Port remainder pool elements to waitlist status
    for (let i = numWinners; i < shuffled.length; i++) {
      const applicant = shuffled[i];

      results.push({
        lotteryRunId,
        username: applicant.username,
        site,
        area,
        bedroom: parseInt(bedroom),
        floor: null,
        houseNumber: null,
        status: 'WAITLIST',
        houseId: null,
        applicantId: applicant.id,
      });

      applicantUpdates.push({ id: applicant.id, status: 'WAITLIST' });
    }

    // 4. Batch transaction tracking write action loop
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
      message: 'Lottery processed successfully.',
      lotteryRunId,
      totalWinners: numWinners,
      totalWaitlisted: results.length - numWinners,
    });
  } catch (error) {
    console.error('RunLottery error:', error);
    res.status(500).json({ error: 'Internal server lottery processing engine failure.' });
  }
};

// 3. BULK EXCEL EXPORTER (BULLETPROOF ASYNC FLUSH STREAM)
// =========================================================================
export const downloadResultsExcel = async (req, res) => {
  try {
    const { runId } = req.params;

    // Pull down records with related models explicitly loaded
    const results = await prisma.lotteryResult.findMany({
      where: { lotteryRunId: runId },
      include: {
        applicant: { select: { idCode: true, bedroom: true } },
        house: { select: { block: true, bedroom: true } }
      }
    });

    if (results.length === 0) {
      return res.status(404).json({ error: 'No logs found tracking this specific draw token.' });
    }

    // Sort order mapping: WINNER rows pop to top, followed alphabetically by name
    results.sort((a, b) => {
      if (a.status === 'WINNER' && b.status !== 'WINNER') return -1;
      if (a.status !== 'WINNER' && b.status === 'WINNER') return 1;
      return a.username.localeCompare(b.username);
    });

    // Formulate a dynamic, clean filename string combination using cluster metrics
    const sampleRecord = results[0];
    const fallbackBedroom = sampleRecord.bedroom ?? sampleRecord.house?.bedroom ?? sampleRecord.applicant?.bedroom ?? 0;
    const customFileName = `${sampleRecord.site}_${sampleRecord.area}_${fallbackBedroom}BR_Results`;

    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet('Lottery Results');

    // Structural table mapping configuration
    worksheet.columns = [
      { header: 'Applicant ID', key: 'idCode', width: 15 },
      { header: 'Username', key: 'username', width: 25 },
      { header: 'Site', key: 'site', width: 15 },
      { header: 'Area', key: 'area', width: 12 },
      { header: 'Bed Room', key: 'bedroom', width: 12 },
      { header: 'Block', key: 'block', width: 12 },
      { header: 'House Number', key: 'houseNumber', width: 15 },
      { header: 'Floor', key: 'floor', width: 10 },
      { header: 'Status', key: 'status', width: 12 },
      { header: 'Draw Date', key: 'drawDate', width: 15 },
    ];

    // Style the primary structural header row (CBE Deep Slate/Blue Style)
    worksheet.getRow(1).font = { bold: true, color: { argb: 'FFFFFFFF' } };
    worksheet.getRow(1).fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF1E3A5F' } };

  // Process row append strings
    results.forEach((r) => {
      const isWinner = r.status === 'WINNER';
      const exactBedroomCount = r.bedroom ?? r.house?.bedroom ?? r.applicant?.bedroom ?? '';

      // 💡 THE FIX: If applicant is waitlisted, force property variables to blank strings ""
      const row = worksheet.addRow({
        idCode: r.applicant?.idCode || '',
        username: r.username,
        site: r.site,
        area: r.area,
        bedroom: exactBedroomCount,
        block: isWinner ? (r.house?.block || '') : '',         // Blank if waitlisted
        houseNumber: isWinner ? (r.houseNumber || '') : '',   // Blank if waitlisted
        floor: isWinner ? (r.floor ?? '') : '',               // Blank if waitlisted
        status: r.status,
        drawDate: r.drawDate.toISOString().split('T')[0],
      });

      // Conditional color block highlight processing matching row type status configurations
      const statusCell = row.getCell('status');
      if (isWinner) {
        statusCell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFD4EDDA' } };
        statusCell.font = { color: { argb: 'FF155724' }, bold: true };
      } else {
        statusCell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFFFF3CD' } };
        statusCell.font = { color: { argb: 'FF856404' }, bold: true };
      }
    });

    // Set responsive transmission content headers
    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
    res.setHeader('Content-Disposition', `attachment; filename=${encodeURIComponent(customFileName)}.xlsx`);

    // SAFE ZONE: Stream bytes to system pipe completely before dropping connection thread
    workbook.xlsx.write(res)
      .then(() => {
        res.end();
      })
      .catch((streamErr) => {
        console.error('Buffer flushing stream error:', streamErr);
        if (!res.headersSent) res.status(500).json({ error: 'Excel stream write execution failed.' });
      });

  } catch (error) {
    console.error('DownloadExcel error macro exception catch:', error);
    if (!res.headersSent) res.status(500).json({ error: 'Server could not compile document mapping.' });
  }
};

export const getLotteryFilterOptions = async (req, res) => {
  try {
    // Fetch unique combinations of properties that have houses available
    const distinctHouses = await prisma.house.findMany({
      where: { status: 'NONE' },
      distinct: ['site', 'area', 'bedroom'],
      select: {
        site: true,
        area: true,
        bedroom: true
      },
      orderBy: [
        { site: 'asc' },
        { area: 'asc' },
        { bedroom: 'asc' }
      ]
    });

    // Extract unique flat arrays for individual selection boxes
    const sites = [...new Set(distinctHouses.map(h => h.site))];
    const areas = [...new Set(distinctHouses.map(h => h.area))];
    const bedrooms = [...new Set(distinctHouses.map(h => h.bedroom))].filter(b => b !== null);

    res.json({ sites, areas, bedrooms });
  } catch (error) {
    console.error('getLotteryFilterOptions error:', error);
    res.status(500).json({ error: 'Failed to retrieve database filter parameters' });
  }
};

export const getLotteryResults = async (req, res) => {
  try {
    const { runId } = req.params;
    
    // Include related information dynamically from Applicant and House models
    const results = await prisma.lotteryResult.findMany({
      where: { lotteryRunId: runId },
      include: {
        applicant: { select: { idCode: true } },
        house: { select: { block: true, bedroom: true } }
      }
    });

    // Sort matching your original logic structure (WINNERS first, then alphabetical)
    results.sort((a, b) => {
      if (a.status === 'WINNER' && b.status !== 'WINNER') return -1;
      if (a.status !== 'WINNER' && b.status === 'WINNER') return 1;
      return a.username.localeCompare(b.username);
    });

    // Flatten data cleanly for frontend consumption
    const formattedResults = results.map(r => ({
      id: r.id,
      lotteryRunId: r.lotteryRunId,
      username: r.username,
      applicantIdCode: r.applicant?.idCode || '—',
      site: r.site,
      area: r.area,
      bedroom: r.bedroom ?? r.house?.bedroom ?? '—', 
      block: r.house?.block || '—',
      houseNumber: r.houseNumber,
      floor: r.floor,
      status: r.status,
      drawDate: r.drawDate
    }));

    res.json(formattedResults);
  } catch (error) {
    console.error('GetResults error:', error);
    res.status(500).json({ error: 'Failed to fetch results' });
  }
};

// export const downloadResultsExcel = async (req, res) => {
//   try {
//     const { runId } = req.params;
//     const results = await prisma.lotteryResult.findMany({
//       where: { lotteryRunId: runId },
//       include: {
//         applicant: { select: { idCode: true } },
//         house: { select: { block: true, bedroom: true } }
//       }
//     });

//     results.sort((a, b) => {
//       if (a.status === 'WINNER' && b.status !== 'WINNER') return -1;
//       if (a.status !== 'WINNER' && b.status === 'WINNER') return 1;
//       return a.username.localeCompare(b.username);
//     });

//     if (results.length === 0) {
//       return res.status(404).json({ error: 'No results found for this run' });
//     }

//     const workbook = new ExcelJS.Workbook();
//     const worksheet = workbook.addWorksheet('Lottery Results');

//     // Added columns matching your requirement block
//     worksheet.columns = [
//       { header: 'Applicant ID', key: 'idCode', width: 15 },
//       { header: 'Username', key: 'username', width: 25 },
//       { header: 'Site', key: 'site', width: 15 },
//       { header: 'Area', key: 'area', width: 12 },
//       { header: 'Bed room', key: 'bedroom', width: 12 },
//       { header: 'Block', key: 'block', width: 12 },
//       { header: 'House Number', key: 'houseNumber', width: 15 },
//       { header: 'Floor', key: 'floor', width: 10 },
//       { header: 'Status', key: 'status', width: 12 },
//       { header: 'Draw Date', key: 'drawDate', width: 15 },
//     ];

//     // Style header row
//     worksheet.getRow(1).font = { bold: true, color: { argb: 'FFFFFFFF' } };
//     worksheet.getRow(1).fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF1E3A5F' } };

//     results.forEach((r) => {
//       const row = worksheet.addRow({
//         idCode: r.applicant?.idCode || '—',
//         username: r.username,
//         site: r.site,
//         area: r.area,
//         bedroom: r.bedroom ?? r.house?.bedroom ?? '—',
//         block: r.house?.block || '—',
//         houseNumber: r.houseNumber || '—',
//         floor: r.floor ?? '—',
//         status: r.status,
//         drawDate: r.drawDate.toISOString().split('T')[0],
//       });

//       const statusCell = row.getCell('status');
//       if (r.status === 'WINNER') {
//         statusCell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFD4EDDA' } };
//         statusCell.font = { color: { argb: 'FF155724' }, bold: true };
//       } else {
//         statusCell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFFFF3CD' } };
//         statusCell.font = { color: { argb: 'FF856404' }, bold: true };
//       }
//     });

//     res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
//     res.setHeader('Content-Disposition', `attachment; filename=Lottery_Results_${runId.slice(0, 8)}.xlsx`);

//     await workbook.xlsx.write(res);
//     res.end();
//   } catch (error) {
//     console.error('DownloadExcel error:', error);
//     res.status(500).json({ error: 'Failed to generate Excel file' });
//   }
// };