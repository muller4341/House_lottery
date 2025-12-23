

import { prisma } from '../utils/prismaClient.js';
import XLSX from 'xlsx';

const formatDate = (date) => {
  return new Intl.DateTimeFormat('en-GB', { 
    day: '2-digit', 
    month: 'short', 
    year: 'numeric' 
  }).format(new Date(date));
};

const getShiftLabel = (shift) => {
  if (!shift) return '';
  return shift === 'I' ? 'Shift I' : 'Shift II';
};

// export const createAssignment = async (req, res) => {
//   try {
//     const {
//       date,
//       branchId,
//       officer1Id,
//       officer1Shift,
//       officer1Phone,
//       officer2Id,
//       officer2Shift,
//       officer2Phone,
//       tl1Id,
//       tl1Shift,
//       tl1Phone,
//       tl2Id,
//       tl2Shift,
//       tl2Phone
//     } = req.body;
//     const userId = req.user?.id;

//     // Fetch branch to populate
//     const branch = await prisma.branch.findUnique({ where: { id: branchId } });
//     if (!branch) return res.status(404).json({ error: 'Branch not found' });

//     // Full validation
//     if (!date || !branchId || !officer1Id || !officer2Id || !officer1Shift || !officer2Shift || (!tl1Id && !tl2Id)) {
//       return res.status(400).json({ error: 'Required fields missing: date, branchId, officer1Id, officer1Shift, officer2Id, officer2Shift, at least one TL' });
//     }
//     if (officer1Shift !== 'I' && officer1Shift !== 'II') return res.status(400).json({ error: 'Officer 1 shift must be I or II' });
//     if (officer2Shift !== 'I' && officer2Shift !== 'II') return res.status(400).json({ error: 'Officer 2 shift must be I or II' });
//     if (tl1Id && (tl1Shift !== 'I' && tl1Shift !== 'II')) return res.status(400).json({ error: 'TL1 shift must be I or II if assigned' });
//     if (tl2Id && (tl2Shift !== 'I' && tl2Shift !== 'II')) return res.status(400).json({ error: 'TL2 shift must be I or II if assigned' });

//     // Find users (validate exist and active)
//     const officer1 = await prisma.user.findUnique({ where: { id: officer1Id } });
//     if (!officer1 || officer1.status !== 0) return res.status(404).json({ error: 'Active Officer 1 not found' });
//     const officer2 = await prisma.user.findUnique({ where: { id: officer2Id } });
//     if (!officer2 || officer2.status !== 0) return res.status(404).json({ error: 'Active Officer 2 not found' });
//     let tl1 = null, tl2 = null;
//     if (tl1Id) {
//       tl1 = await prisma.user.findUnique({ where: { id: tl1Id } });
//       if (!tl1 || tl1.status !== 0) return res.status(404).json({ error: 'Active TL1 not found' });
//     }
//     if (tl2Id) {
//       tl2 = await prisma.user.findUnique({ where: { id: tl2Id } });
//       if (!tl2 || tl2.status !== 0) return res.status(404).json({ error: 'Active TL2 not found' });
//     }

//     // Validate same user on different shifts only
//     if (officer1Id === officer2Id && officer1Shift === officer2Shift) {
//       return res.status(400).json({ error: 'Same officer cannot be assigned to the same shift twice' });
//     }
//     if (tl1Id && tl2Id && tl1Id === tl2Id && tl1Shift === tl2Shift) {
//       return res.status(400).json({ error: 'Same team leader cannot be assigned to the same shift twice' });
//     }

//     // Check for duplicate assignment on same date/branch
//     const existing = await prisma.assignment.findFirst({
//       where: { date: new Date(date), branchId }
//     });
//     if (existing) return res.status(409).json({ error: 'Assignment already exists for this date and branch' });

//     const assignment = await prisma.assignment.create({
//       data: {
//         date: new Date(date),
//         branchId,
//         branchName: branch.name,
//         accountOfficerEmployeeId: branch.accountOfficerId,  // Now valid after schema update
//         officer1Id,
//         officer1Shift,
//         officer1Phone: officer1Phone || null,
//         officer2Id,
//         officer2Shift,
//         officer2Phone: officer2Phone || null,
//         tl1Id: tl1Id || null,
//         tl1Shift: tl1Shift || null,
//         tl1Phone: tl1Phone || null,
//         tl2Id: tl2Id || null,
//         tl2Shift: tl2Shift || null,
//         tl2Phone: tl2Phone || null
//       },
//       include: {
//         branch: true,
//         officer1: { select: { id: true, name: true, phone: true } },
//         officer2: { select: { id: true, name: true, phone: true } },
//         tl1: { select: { id: true, name: true, phone: true } },
//         tl2: { select: { id: true, name: true, phone: true } }
//       }
//     });

//     // Audit log
//     if (userId) {
//       await prisma.auditLog.create({
//         data: {
//           action: 'CREATE_ASSIGNMENT',
//           details: JSON.stringify({ date, branchId, officer1Id, officer2Id }),
//           userId,
//           entityId: assignment.id
//         }
//       });
//     }

//     res.status(201).json(assignment);
//   } catch (error) {
//     console.error('Create assignment error:', error);
//     res.status(500).json({ error: error.message || 'Failed to create assignment' });
//   }
// };

// Update (similar fixes)
export const createAssignment = async (req, res) => {
  try {
    // Extract and fix arrays
    let { 
      date,
      branchIds,
      accountOfficerEmployeeIds,
      officer1Id,
      officer1Shift,
      officer1Phone,
      officer2Id,
      officer2Shift,
      officer2Phone,
      tl1Id,
      tl1Shift,
      tl1Phone,
      tl2Id,
      tl2Shift,
      tl2Phone
    } = req.body;

    // Convert string to array if needed
    if (typeof branchIds === 'string') {
      branchIds = branchIds.split(',').map(id => id.trim()).filter(id => id);
    }
    if (typeof accountOfficerEmployeeIds === 'string') {
      accountOfficerEmployeeIds = accountOfficerEmployeeIds.split(',').map(id => id.trim()).filter(id => id);
    }

    // Validate ALL required fields
    if (
      !date ||
      !branchIds?.length ||
      !accountOfficerEmployeeIds?.length ||
      accountOfficerEmployeeIds.some(id => !/^\d{4}$/.test(id)) ||
      !officer1Id ||
      !officer1Shift ||
      !officer1Phone ||
      !officer2Id ||
      !officer2Shift ||
      !officer2Phone ||
      !tl1Id ||
      !tl1Shift ||
      !tl1Phone ||
      !tl2Id ||
      !tl2Shift ||
      !tl2Phone
    ) {
      return res.status(400).json({ 
        error: 'Missing required fields. Ensure all fields are filled: Date, Branches, AO IDs (4 digits), Officers 1 & 2 (with shifts and phones), Team Leaders 1 & 2 (with shifts and phones).'
      });
    }

    // Fetch branches
    const branches = await prisma.branch.findMany({
      where: { id: { in: branchIds } }
    });

    if (branches.length !== branchIds.length) {
      return res.status(404).json({ error: 'One or more branches not found' });
    }

    const branchNames = branches.map(b => b.name);

    // Validate users
    const officer1 = await prisma.user.findUnique({ where: { id: officer1Id } });
    if (!officer1 || officer1.status !== 0) return res.status(404).json({ error: 'Officer 1 not found or inactive' });

    const officer2 = await prisma.user.findUnique({ where: { id: officer2Id } });
    if (!officer2 || officer2.status !== 0) return res.status(404).json({ error: 'Officer 2 not found or inactive' });

    const tl1 = await prisma.user.findUnique({ where: { id: tl1Id } });
    if (!tl1 || tl1.status !== 0) return res.status(404).json({ error: 'TL1 not found or inactive' });

    const tl2 = await prisma.user.findUnique({ where: { id: tl2Id } });
    if (!tl2 || tl2.status !== 0) return res.status(404).json({ error: 'TL2 not found or inactive' });

    // Create assignment
    const assignment = await prisma.assignment.create({
      data: {
        date: new Date(date),
        branchId: branchIds[0],
        branchIds: branchIds.join(','),
        branchName: branches[0]?.name || '',
        branchNames: branchNames.join(', '),
        accountOfficerEmployeeId: accountOfficerEmployeeIds[0],
        accountOfficerEmployeeIds: accountOfficerEmployeeIds.join(', '),
        officer1Id,
        officer1Shift,
        officer1Phone,
        officer2Id,
        officer2Shift,
        officer2Phone,
        tl1Id,
        tl1Shift,
        tl1Phone,
        tl2Id,
        tl2Shift,
        tl2Phone
      },
      include: {
        officer1: { select: { name: true, phone: true } },
        officer2: { select: { name: true, phone: true } },
        tl1: { select: { name: true, phone: true } },
        tl2: { select: { name: true, phone: true } }
      }
    });

    res.status(201).json(assignment);
  } catch (error) {
    console.error('Create assignment error:', error);
    res.status(500).json({ error: 'Failed to create assignment' });
  }
};
// export const updateAssignment = async (req, res) => {
//   try {
//     const { id } = req.params;
//     const {
//       date,
//       branchId,
//       officer1Id,
//       officer1Shift,
//       officer1Phone,
//       officer2Id,
//       officer2Shift,
//       officer2Phone,
//       tl1Id,
//       tl1Shift,
//       tl1Phone,
//       tl2Id,
//       tl2Shift,
//       tl2Phone
//     } = req.body;
//     const userId = req.user?.id;

//     // Fetch branch if provided
//     let branch = null;
//     if (branchId) {
//       branch = await prisma.branch.findUnique({ where: { id: branchId } });
//       if (!branch) return res.status(404).json({ error: 'Branch not found' });
//     }

//     // Full validation (reuse from create logic)
//     if (!date || !branchId || !officer1Id || !officer2Id || !officer1Shift || !officer2Shift || (!tl1Id && !tl2Id)) {
//       return res.status(400).json({ error: 'Required fields missing' });
//     }
//     if (officer1Shift !== 'I' && officer1Shift !== 'II') return res.status(400).json({ error: 'Officer 1 shift must be I or II' });
//     if (officer2Shift !== 'I' && officer2Shift !== 'II') return res.status(400).json({ error: 'Officer 2 shift must be I or II' });
//     if (tl1Id && (tl1Shift !== 'I' && tl1Shift !== 'II')) return res.status(400).json({ error: 'TL1 shift must be I or II if assigned' });
//     if (tl2Id && (tl2Shift !== 'I' && tl2Shift !== 'II')) return res.status(400).json({ error: 'TL2 shift must be I or II if assigned' });

//     // Find users (validate exist and active)
//     const officer1 = await prisma.user.findUnique({ where: { id: officer1Id } });
//     if (!officer1 || officer1.status !== 0) return res.status(404).json({ error: 'Active Officer 1 not found' });
//     const officer2 = await prisma.user.findUnique({ where: { id: officer2Id } });
//     if (!officer2 || officer2.status !== 0) return res.status(404).json({ error: 'Active Officer 2 not found' });
//     let tl1 = null, tl2 = null;
//     if (tl1Id) {
//       tl1 = await prisma.user.findUnique({ where: { id: tl1Id } });
//       if (!tl1 || tl1.status !== 0) return res.status(404).json({ error: 'Active TL1 not found' });
//     }
//     if (tl2Id) {
//       tl2 = await prisma.user.findUnique({ where: { id: tl2Id } });
//       if (!tl2 || tl2.status !== 0) return res.status(404).json({ error: 'Active TL2 not found' });
//     }

//     // Validate same user on different shifts only
//     if (officer1Id === officer2Id && officer1Shift === officer2Shift) {
//       return res.status(400).json({ error: 'Same officer cannot be assigned to the same shift twice' });
//     }
//     if (tl1Id && tl2Id && tl1Id === tl2Id && tl1Shift === tl2Shift) {
//       return res.status(400).json({ error: 'Same team leader cannot be assigned to the same shift twice' });
//     }

//     // Check duplicate if date/branch changed
//     const existing = await prisma.assignment.findFirst({
//       where: { date: new Date(date), branchId, NOT: { id } }
//     });
//     if (existing) return res.status(409).json({ error: 'Assignment already exists for this date and branch' });

//     const updated = await prisma.assignment.update({
//       where: { id },
//       data: {
//         date: new Date(date),
//         branchId,
//         branchName: branch ? branch.name : undefined,
//         accountOfficerEmployeeId: branch ? branch.accountOfficerId : undefined,  // Now valid
//         officer1Id,
//         officer1Shift,
//         officer1Phone: officer1Phone || null,
//         officer2Id,
//         officer2Shift,
//         officer2Phone: officer2Phone || null,
//         tl1Id: tl1Id || null,
//         tl1Shift: tl1Shift || null,
//         tl1Phone: tl1Phone || null,
//         tl2Id: tl2Id || null,
//         tl2Shift: tl2Shift || null,
//         tl2Phone: tl2Phone || null
//       },
//       include: {
//         branch: true,
//         officer1: { select: { id: true, name: true, phone: true } },
//         officer2: { select: { id: true, name: true, phone: true } },
//         tl1: { select: { id: true, name: true, phone: true } },
//         tl2: { select: { id: true, name: true, phone: true } }
//       }
//     });

//     // Audit
//     if (userId) {
//       await prisma.auditLog.create({
//         data: {
//           action: 'UPDATE_ASSIGNMENT',
//           details: JSON.stringify(req.body),
//           userId,
//           entityId: id
//         }
//       });
//     }

//     res.json(updated);
//   } catch (error) {
//     console.error('Update assignment error:', error);
//     res.status(500).json({ error: error.message || 'Failed to update assignment' });
//   }
// };

// Delete (minor fix: full message)
export const deleteAssignment = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user?.id;

    const assignment = await prisma.assignment.findUnique({ where: { id } });
    if (!assignment) return res.status(404).json({ error: 'Assignment not found' });

    await prisma.assignment.delete({ where: { id } });

    // Audit log
    if (userId) {
      await prisma.auditLog.create({
        data: {
          action: 'DELETE_ASSIGNMENT',
          userId,
          entityId: id
        }
      });
    }

    res.json({ message: 'Assignment deleted successfully' });
  } catch (error) {
    console.error('Error deleting assignment:', error);
    res.status(500).json({ error: 'Failed to delete assignment' });
  }
};

export const updateAssignment = async (req, res) => {
  try {
    const { id } = req.params;
    const {
      date,
      branchIds = [],
      accountOfficerEmployeeIds = [],
      officer1Id,
      officer1Shift,
      officer1Phone,
      officer2Id,
      officer2Shift,
      officer2Phone,
      tl1Id,
      tl1Shift,
      tl1Phone,
      tl2Id,
      tl2Shift,
      tl2Phone
    } = req.body;

    const userId = req.user?.id;

    // Convert string to array if needed
    let finalBranchIds = branchIds;
    let finalAoIds = accountOfficerEmployeeIds;

    if (typeof branchIds === 'string') {
      finalBranchIds = branchIds.split(',').map(id => id.trim()).filter(Boolean);
    }
    if (typeof accountOfficerEmployeeIds === 'string') {
      finalAoIds = accountOfficerEmployeeIds.split(',').map(id => id.trim()).filter(Boolean);
    }

    // Validation
    if (!date || finalBranchIds.length === 0 || finalAoIds.length === 0) {
      return res.status(400).json({ error: 'Date, branches, and AO IDs are required' });
    }
    if (!officer1Id || !officer1Shift || !officer2Id || !officer2Shift) {
      return res.status(400).json({ error: 'Both officers and their shifts are required' });
    }
    if (!['I', 'II'].includes(officer1Shift) || !['I', 'II'].includes(officer2Shift)) {
      return res.status(400).json({ error: 'Invalid shift value' });
    }
    if (tl1Id && tl1Shift && !['I', 'II'].includes(tl1Shift)) {
      return res.status(400).json({ error: 'Invalid TL1 shift' });
    }
    if (tl2Id && tl2Shift && !['I', 'II'].includes(tl2Shift)) {
      return res.status(400).json({ error: 'Invalid TL2 shift' });
    }

    // Validate users exist and active
    const officer1 = await prisma.user.findUnique({ where: { id: officer1Id } });
    const officer2 = await prisma.user.findUnique({ where: { id: officer2Id } });
    if (!officer1 || officer1.status !== 0) return res.status(404).json({ error: 'Officer 1 not found or inactive' });
    if (!officer2 || officer2.status !== 0) return res.status(404).json({ error: 'Officer 2 not found or inactive' });

    let tl1 = null, tl2 = null;
    if (tl1Id) {
      tl1 = await prisma.user.findUnique({ where: { id: tl1Id } });
      if (!tl1 || tl1.status !== 0) return res.status(404).json({ error: 'TL1 not found or inactive' });
    }
    if (tl2Id) {
      tl2 = await prisma.user.findUnique({ where: { id: tl2Id } });
      if (!tl2 || tl2.status !== 0) return res.status(404).json({ error: 'TL2 not found or inactive' });
    }

    // Validate branches exist
    const branches = await prisma.branch.findMany({
      where: { id: { in: finalBranchIds } }
    });
    if (branches.length !== finalBranchIds.length) {
      return res.status(404).json({ error: 'One or more branches not found' });
    }

    const branchNames = branches.map(b => b.name).join(', ');
    const firstBranchId = finalBranchIds[0];

    // Check for duplicate assignment on same date (EXCEPT current assignment)
    const existing = await prisma.assignment.findFirst({
      where: {
        date: new Date(date),
        branchIds: { contains: firstBranchId }, // at least one overlapping branch
        NOT: { id }
      }
    });
    if (existing) {
      return res.status(409).json({ 
        error: 'An assignment already exists on this date for one of the selected branches' 
      });
    }

    // UPDATE
    const updated = await prisma.assignment.update({
      where: { id },
      data: {
        date: new Date(date),
        branchId: firstBranchId,
        branchIds: finalBranchIds.join(','),
        branchName: branches[0]?.name || '',
        branchNames,
        accountOfficerEmployeeId: finalAoIds[0] || '',
        accountOfficerEmployeeIds: finalAoIds.join(', '),
        officer1Id,
        officer1Shift,
        officer1Phone: officer1Phone || null,
        officer2Id,
        officer2Shift,
        officer2Phone: officer2Phone || null,
        tl1Id: tl1Id || null,
        tl1Shift: tl1Shift || null,
        tl1Phone: tl1Phone || null,
        tl2Id: tl2Id || null,
        tl2Shift: tl2Shift || null,
        tl2Phone: tl2Phone || null
      },
      include: {
        officer1: { select: { name: true, phone: true } },
        officer2: { select: { name: true, phone: true } },
        tl1: { select: { name: true, phone: true } },
        tl2: { select: { name: true, phone: true } }
      }
    });

    // Audit log
    if (userId) {
      await prisma.auditLog.create({
        data: {
          action: 'UPDATE_ASSIGNMENT',
          details: JSON.stringify(req.body),
          userId,
          entityId: id
        }
      });
    }

    res.json(updated);
  } catch (error) {
    console.error('Update assignment error:', error);
    res.status(500).json({ error: error.message || 'Failed to update assignment' });
  }
};

// export const getAssignments = async (req, res) => {
//   try {
//     const { page = 1, limit = 10 } = req.query;
//     const skip = (page - 1) * limit;
//     const assignments = await prisma.assignment.findMany({
//       skip,
//       take: parseInt(limit),
//       orderBy: { date: 'desc' },
//       include: {
//         branch: { select: { name: true } },
//         officer1: { select: { name: true } },
//         officer2: { select: { name: true } },
//         tl1: { select: { name: true } },
//         tl2: { select: { name: true } }
//       }
//     });
//     const total = await prisma.assignment.count();

//     // Enrich with branchName if branch null (fallback)
//     const enrichedAssignments = assignments.map(a => ({
//       ...a,
//       branchName: a.branch?.name || a.branchName
//     }));

//     res.json({ assignments: enrichedAssignments, total, page: parseInt(page), limit: parseInt(limit) });
//   } catch (error) {
//     console.error('Get assignments error:', error);
//     res.status(500).json({ error: 'Failed to fetch assignments' });
//   }
// };

export const getAssignments = async (req, res) => {
  try {
    const { page = 1, limit = 10000, date } = req.query;
    const skip = (page - 1) * limit;

    // BUILD WHERE FILTER — THIS IS THE FIX
    const where = {};
    if (date) {
      const startOfDay = new Date(date);
      startOfDay.setUTCHours(0, 0, 0, 0);
      
      const endOfDay = new Date(date);
      endOfDay.setUTCHours(23, 59, 59, 999);

      where.date = {
        gte: startOfDay,
        lte: endOfDay
      };
    }

    const assignments = await prisma.assignment.findMany({
      where,
      skip: parseInt(skip),
      take: parseInt(limit),
      orderBy: { date: 'desc' },
      include: {
        branch: { 
          select: { name: true, accountOfficerId: true } 
        },
        officer1: { select: { name: true, phone: true } },
        officer2: { select: { name: true, phone: true } },
        tl1: { select: { name: true, phone: true } },
        tl2: { select: { name: true, phone: true } }
      }
    });

    const total = await prisma.assignment.count({ where });

    // Your enrichment code (perfect as is)
    const enrichedAssignments = assignments.map(a => ({
      ...a,
      branchIds: a.branchIds ? a.branchIds.split(',').map(id => id.trim()) : [],
      branchNames: a.branchNames || a.branch?.name || '—',
      accountOfficerEmployeeIds: a.accountOfficerEmployeeIds 
        ? a.accountOfficerEmployeeIds.split(',').map(id => id.trim()) 
        : (a.branch?.accountOfficerId ? [a.branch.accountOfficerId] : []),
      branchName: a.branchNames?.split(', ')[0]?.trim() || a.branch?.name || '—',
      accountOfficerEmployeeId: a.accountOfficerEmployeeIds?.split(', ')[0]?.trim() || a.branch?.accountOfficerId || '—',
      officer1Phone: a.officer1Phone || a.officer1?.phone || '—',
      officer2Phone: a.officer2Phone || a.officer2?.phone || '—',
      tl1Phone: a.tl1Phone || a.tl1?.phone || '—',
      tl2Phone: a.tl2Phone || a.tl2?.phone || '—'
    }));

    res.json({
      assignments: enrichedAssignments,
      total,
      page: parseInt(page),
      limit: parseInt(limit)
    });
  } catch (error) {
    console.error('Get assignments error:', error);
    res.status(500).json({ error: 'Failed to fetch assignments' });
  }
};
// GET /api/assignments/my-assignments?userId=xxx
export const getMyAssignments = async (req, res) => {
  try {
    // GET USER FROM MIDDLEWARE — NOT FROM QUERY
    const userId = req.user.id;   // ← THIS IS THE KEY

    if (!userId) {
      return res.status(401).json({ error: "Unauthorized" });
    }

    const assignments = await prisma.assignment.findMany({
      where: {
        OR: [
          { officer1Id: userId },
          { officer2Id: userId },
          { tl1Id: userId },
          { tl2Id: userId }
        ]
      },
      include: {
        branch: true,
        officer1: { select: { name: true, phone: true } },
        officer2: { select: { name: true, phone: true } },
        tl1: { select: { name: true, phone: true } },
        tl2: { select: { name: true, phone: true } }
      },
      orderBy: { date: 'desc' }
    });

    console.log("Found assignments for user:", userId, assignments.length);
    res.json({ assignments });
  } catch (error) {
    console.error("Error in getMyAssignments:", error);
    res.status(500).json({ error: "Failed to fetch assignments" });
  }
};

// Bulk (fixed to work with Excel format: lookup by name, not ID)
export const bulkCreateAssignments = async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ error: 'No file uploaded' });

    const workbook = XLSX.read(req.file.buffer, { type: 'buffer' });
    const sheet = workbook.Sheets[workbook.SheetNames[0]];
    const rows = XLSX.utils.sheet_to_json(sheet, { defval: '', raw: false });

    if (rows.length === 0) return res.status(400).json({ error: 'No data in Excel sheet' });

    const created = [];
    const errors = [];

    for (let i = 0; i < rows.length; i++) {
      const row = rows[i];
      const rowNum = i + 2; // Header is row 1

      try {
        // Lookup branch by name
        const branch = await prisma.branch.findFirst({
          where: {
            name: { contains: row['Branch']?.trim() || '', mode: 'insensitive' }
          }
        });
        if (!branch) throw new Error(`Branch "${row['Branch']}" not found`);

        // Lookup users by name (active only)
        const findUser = async (name) => {
          if (!name || name.trim() === '' || name === '-') return null;
          const user = await prisma.user.findFirst({
            where: { name: { contains: name.trim(), mode: 'insensitive' }, status: 0 }
          });
          if (!user) throw new Error(`Active user "${name}" not found`);
          return user;
        };

        const officer1 = await findUser(row['Officer 1']);
        const officer2 = await findUser(row['Officer 2']);
        const tl1 = await findUser(row['TL 1']);
        const tl2 = await findUser(row['TL 2']);

        if (!officer1 || !officer2) throw new Error('Required officers not found');

        // Parse date (e.g., '03 Dec 2025')
        const assignmentDate = new Date(row['Date']);
        if (isNaN(assignmentDate.getTime())) throw new Error(`Invalid date "${row['Date']}"`);

        // Check duplicate
        const existing = await prisma.assignment.findFirst({
          where: { date: assignmentDate, branchId: branch.id }
        });
        if (existing) throw new Error('Assignment already exists for this date and branch');

        // Parse shifts (from 'Shift I' to 'I')
        const parseShift = (shiftStr) => shiftStr?.includes('I') ? 'I' : 'II';

        const officer1Shift = parseShift(row['Officer 1 Shift']);
        const officer2Shift = parseShift(row['Officer 2 Shift']);
        const tl1Shift = tl1 ? parseShift(row['TL 1 Shift']) : null;
        const tl2Shift = tl2 ? parseShift(row['TL 2 Shift']) : null;

        // Validate same user on different shifts only
        if (officer1.id === officer2.id && officer1Shift === officer2Shift) {
          throw new Error('Same officer cannot be assigned to the same shift twice');
        }
        if (tl1 && tl2 && tl1.id === tl2.id && tl1Shift === tl2Shift) {
          throw new Error('Same team leader cannot be assigned to the same shift twice');
        }

        // Create assignment
        const assignment = await prisma.assignment.create({
          data: {
            date: assignmentDate,
            branchId: branch.id,
            branchName: branch.name,
            accountOfficerEmployeeId: row['AO ID']?.trim() || branch.accountOfficerId,
            officer1Id: officer1.id,
            officer1Shift: officer1Shift,
            officer1Phone: row['Officer 1 Phone']?.trim() || officer1.phone || null,
            officer2Id: officer2.id,
            officer2Shift: officer2Shift,
            officer2Phone: row['Officer 2 Phone']?.trim() || officer2.phone || null,
            tl1Id: tl1?.id || null,
            tl1Shift: tl1Shift,
            tl1Phone: tl1 ? row['TL 1 Phone']?.trim() || tl1.phone || null : null,
            tl2Id: tl2?.id || null,
            tl2Shift: tl2Shift,
            tl2Phone: tl2 ? row['TL 2 Phone']?.trim() || tl2.phone || null : null
          },
          include: {
            branch: true,
            officer1: true,
            officer2: true,
            tl1: true,
            tl2: true
          }
        });

        created.push(assignment);
      } catch (rowError) {
        errors.push(`Row ${rowNum}: ${rowError.message}`);
      }
    }

    if (errors.length > 0) {
      console.error('Bulk errors:', errors);
    }

    res.status(201).json({ 
      message: `${created.length} assignments created, ${errors.length} errors`,
      created,
      errors 
    });
  } catch (error) {
    console.error('Bulk error:', error);
    res.status(500).json({ error: 'Bulk upload failed' });
  }
};

// Export (full) - name kept as exportToCSV, but handles excel
export const exportToCSV = async (req, res) => {
  const { format = 'csv' } = req.query;
  try {
    const assignments = await prisma.assignment.findMany({
      orderBy: { date: 'desc' },
      include: {
        branch: true,
        officer1: { select: { name: true, phone: true } },
        officer2: { select: { name: true, phone: true } },
        tl1: { select: { name: true, phone: true } },
        tl2: { select: { name: true, phone: true } }
      }
    });

    if (format === 'excel') {
      const wb = XLSX.utils.book_new();
      const wsData = [
        ['Date', 'Branch Name', 'Account Officer ID', 'Officer 1 Name', 'Officer 1 Phone', 'Officer 1 Shift',
         'Officer 2 Name', 'Officer 2 Phone', 'Officer 2 Shift', 'TL1 Name', 'TL1 Phone', 'TL1 Shift',
         'TL2 Name', 'TL2 Phone', 'TL2 Shift']
      ];
      assignments.forEach(a => {
        wsData.push([
          formatDate(a.date),
          a.branchName,
          a.accountOfficerEmployeeId,
          a.officer1?.name || '',
          a.officer1Phone || a.officer1?.phone || '',
          getShiftLabel(a.officer1Shift),
          a.officer2?.name || '',
          a.officer2Phone || a.officer2?.phone || '',
          getShiftLabel(a.officer2Shift),
          a.tl1?.name || '',
          a.tl1Phone || a.tl1?.phone || '',
          getShiftLabel(a.tl1Shift),
          a.tl2?.name || '',
          a.tl2Phone || a.tl2?.phone || '',
          getShiftLabel(a.tl2Shift)
        ]);
      });
      const ws = XLSX.utils.aoa_to_sheet(wsData);
      XLSX.utils.book_append_sheet(wb, ws, 'Assignments');
      const buf = XLSX.write(wb, { type: 'buffer', bookType: 'xlsx' });

      res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
      res.setHeader('Content-Disposition', 'attachment; filename=central_kyc_assignments.xlsx');
      res.send(buf);
    } else {
      let csv = 'Date,Branch Name,Account Officer ID,Officer 1 Name,Officer 1 Phone,Officer 1 Shift,Officer 2 Name,Officer 2 Phone,Officer 2 Shift,TL1 Name,TL1 Phone,TL1 Shift,TL2 Name,TL2 Phone,TL2 Shift\n';
      assignments.forEach(a => {
        csv += [
          formatDate(a.date),
          `"${a.branchName}"`,
          a.accountOfficerEmployeeId,
          `"${a.officer1?.name || ''}"`,
          `"${a.officer1Phone || a.officer1?.phone || ''}"`,
          getShiftLabel(a.officer1Shift),
          `"${a.officer2?.name || ''}"`,
          `"${a.officer2Phone || a.officer2?.phone || ''}"`,
          getShiftLabel(a.officer2Shift),
          `"${a.tl1?.name || ''}"`,
          `"${a.tl1Phone || a.tl1?.phone || ''}"`,
          getShiftLabel(a.tl1Shift),
          `"${a.tl2?.name || ''}"`,
          `"${a.tl2Phone || a.tl2?.phone || ''}"`,
          getShiftLabel(a.tl2Shift)
        ].join(',') + '\n';
      });
      res.setHeader('Content-Type', 'text/csv');
      res.setHeader('Content-Disposition', 'attachment; filename=central_kyc_assignments.csv');
      res.status(200).send(csv);
    }
  } catch (error) {
    console.error('Export error:', error);
    res.status(500).json({ error: 'Export failed' });
  }
};

export const getHistoryAssignments = async (req, res) => {
  try {
    const { page = 1, limit = 100000, date, all } = req.query;
    const skip = (page - 1) * limit;

    // BUILD WHERE FILTER
    let where = {};

    // If ?all=true → return ALL assignments (past, present, future) — for History page
    if (all === 'true') {
  where = {};
  limit = 10000; // or remove take/skip completely
  skip = 0;
}
    // If ?date= provided → filter by that specific day
    else if (date) {
      const startOfDay = new Date(date);
      startOfDay.setUTCHours(0, 0, 0, 0);
      
      const endOfDay = new Date(date);
      endOfDay.setUTCHours(23, 59, 59, 999);

      where.date = {
        gte: startOfDay,
        lte: endOfDay
      };
    }
    
    else {
      
    }

    const assignments = await prisma.assignment.findMany({
      where,
      skip: parseInt(skip),
      take: parseInt(limit),
      orderBy: { date: 'desc' },
      include: {
        branch: { 
          select: { name: true, accountOfficerId: true } 
        },
        officer1: { select: { name: true, phone: true } },
        officer2: { select: { name: true, phone: true } },
        tl1: { select: { name: true, phone: true } },
        tl2: { select: { name: true, phone: true } }
      }
    });

    const total = await prisma.assignment.count({ where });

    // Enrich data (your excellent existing logic)
    const enrichedAssignments = assignments.map(a => ({
      ...a,
      branchIds: a.branchIds ? a.branchIds.split(',').map(id => id.trim()) : [],
      branchNames: a.branchNames || a.branch?.name || '—',
      accountOfficerEmployeeIds: a.accountOfficerEmployeeIds 
        ? a.accountOfficerEmployeeIds.split(',').map(id => id.trim()) 
        : (a.branch?.accountOfficerId ? [a.branch.accountOfficerId] : []),
      branchName: a.branchNames?.split(', ')[0]?.trim() || a.branch?.name || '—',
      accountOfficerEmployeeId: a.accountOfficerEmployeeIds?.split(', ')[0]?.trim() || a.branch?.accountOfficerId || '—',
      officer1Phone: a.officer1Phone || a.officer1?.phone || '—',
      officer2Phone: a.officer2Phone || a.officer2?.phone || '—',
      tl1Phone: a.tl1Phone || a.tl1?.phone || '—',
      tl2Phone: a.tl2Phone || a.tl2?.phone || '—'
    }));

    res.json({
      assignments: enrichedAssignments,
      total,
      page: parseInt(page),
      limit: parseInt(limit)
    });
  } catch (error) {
    console.error('Get assignments error:', error);
    res.status(500).json({ error: 'Failed to fetch assignments' });
  }
};