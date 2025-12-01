import { prisma } from '../utils/prismaClient.js';

export const createAssignment = async (req, res) => {
  try {
    const {
      date,
      branchName,
      accountOfficerId,
      officer1Id,
      officer1StartTime,
      officer1EndTime,
      officer1Phone,
      officer2Id,
      officer2StartTime,
      officer2EndTime,
      officer2Phone,
      tl1Id,
      tl1Phone,
      tl2Id,
      tl2Phone
    } = req.body;

    // === Required fields + at least one TL ===
    if (!date || !branchName || !accountOfficerId || !officer1Id || !officer2Id ||
        !officer1StartTime || !officer1EndTime || !officer2StartTime || !officer2EndTime ||
        (!tl1Id && !tl2Id)) {
      return res.status(400).json({
        error: 'Required fields missing. At least one team leader must be selected.'
      });
    }

    // 4-digit account officer
    if (!/^\d{4}$/.test(accountOfficerId)) {
      return res.status(400).json({ error: 'Account Officer ID must be exactly 4 digits.' });
    }

    // === Prevent same person twice ===
    if (officer1Id === officer2Id) {
      return res.status(400).json({ error: 'Officer 1 and Officer 2 must be different people.' });
    }
    if (tl1Id && tl2Id && tl1Id === tl2Id) {
      return res.status(400).json({ error: 'Team Leader 1 and Team Leader 2 must be different people.' });
    }

    // === Find users ===
    const [officer1, officer2, tl1, tl2] = await Promise.all([
      prisma.user.findUnique({ where: { id: officer1Id } }),
      prisma.user.findUnique({ where: { id: officer2Id } }),
      tl1Id ? prisma.user.findUnique({ where: { id: tl1Id } }) : null,
      tl2Id ? prisma.user.findUnique({ where: { id: tl2Id } }) : null
    ]);

    if (!officer1 || !officer2) {
      return res.status(404).json({ error: 'Officer 1 or Officer 2 not found.' });
    }
    if ((tl1Id && !tl1) || (tl2Id && !tl2)) {
      return res.status(404).json({ error: 'Selected team leader not found.' });
    }

    // Optional: fetch account officer for display
    const accountOfficer = await prisma.user.findUnique({
      where: { employeeId: accountOfficerId },
      select: { id: true, employeeId: true, name: true }
    });

    // === Create assignment ===
    const assignment = await prisma.assignment.create({
      data: {
        date: new Date(date),
        branchName,
        accountOfficerEmployeeId: accountOfficerId,
        officer1Id,
        officer1StartTime,
        officer1EndTime,
        officer1Phone: officer1Phone || officer1.phone || null,
        officer2Id,
        officer2StartTime,
        officer2EndTime,   // ← FIXED TYPO (was duplicated officer2StartTime)
        officer2Phone: officer2Phone || officer2.phone || null,
        tl1Id: tl1Id || null,
        tl1Phone: tl1Id ? (tl1Phone || tl1.phone || null) : null,
        tl2Id: tl2Id || null,
        tl2Phone: tl2Id ? (tl2Phone || tl2.phone || null) : null,
      },
      include: {
        officer1: { select: { id: true, name: true, phone: true } },
        officer2: { select: { id: true, name: true, phone: true } },
        tl1: true,   // optional relation → will be null if not set
        tl2: true,   // optional relation → will be null if not set
      }
    });

    res.status(201).json({
      ...assignment,
      accountOfficer: accountOfficer || null
    });
  } catch (error) {
    console.error('Error creating assignment:', error);
    res.status(500).json({ error: 'Failed to create assignment' });
  }
};


export const getAssignments = async (req, res) => {
  try {
    const { page = 1, limit = 10 } = req.query;
    const skip = (Number(page) - 1) * Number(limit);

    const [assignments, total] = await Promise.all([
      prisma.assignment.findMany({
        skip,
        take: Number(limit),
        orderBy: { date: 'desc' },
        include: {
          officer1: { select: { id: true, name: true, phone: true } },
          officer2: { select: { id: true, name: true, phone: true } },
          tl1: true,  // Includes if exists
          tl2: true   // Includes if exists
        }
      }),
      prisma.assignment.count()
    ]);

    // Manually enrich with accountOfficer (fetch by employeeId for each)
    const enrichedAssignments = await Promise.all(
      assignments.map(async (assignment) => {
        const accountOfficer = await prisma.user.findUnique({
          where: { employeeId: assignment.accountOfficerEmployeeId },
          select: { id: true, employeeId: true, name: true }
        });
        return { ...assignment, accountOfficer };
      })
    );

    res.json({
      assignments: enrichedAssignments,
      pagination: {
        page: Number(page),
        limit: Number(limit),
        total,
        pages: Math.ceil(total / Number(limit))
      }
    });
  } catch (error) {
    console.error('Error fetching assignments:', error);
    res.status(500).json({ error: 'Failed to fetch assignments' });
  }
};