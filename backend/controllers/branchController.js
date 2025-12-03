// controllers/branchController.js
// New: CRUD for Branch (name + unique 4-digit AO ID).
// Validation: AO ID exactly 4 digits, unique.
// Audit log on create/update/delete (Manager only).
// Added: Bulk create from array via /api/branches/bulk.
// Fixed: Ensure accountOfficerId is treated as String in queries (Prisma expects String for 'in' clause).

import { prisma } from '../utils/prismaClient.js';

export const getBranches = async (req, res) => {
  try {
    const branches = await prisma.branch.findMany({
      orderBy: { name: 'asc' },
      select: {
        id: true,
        name: true,
        accountOfficerId: true,
        createdAt: true
      }
    });
    res.json(branches);
  } catch (error) {
    console.error('Error fetching branches:', error);
    res.status(500).json({ error: 'Failed to fetch branches' });
  }
};

export const createBranch = async (req, res) => {
  try {
    const { name, accountOfficerId } = req.body;
    const userId = req.user?.id;  // From auth

    // Validate required fields
    if (!name || !accountOfficerId) {
      return res.status(400).json({ error: 'Branch Name and Account Officer ID are required' });
    }

    const aoIdStr = String(accountOfficerId).trim();

    // Validate 4-digit AO ID
    if (!/^\d{4}$/.test(aoIdStr)) {
      return res.status(400).json({ error: 'Account Officer ID must be exactly 4 digits' });
    }

    // Check if AO ID already exists
    const existingBranch = await prisma.branch.findUnique({ where: { accountOfficerId: aoIdStr } });
    if (existingBranch) {
      return res.status(409).json({ error: 'Account Officer ID already exists' });
    }

    // Create branch
    const newBranch = await prisma.branch.create({
      data: {
        name,
        accountOfficerId: aoIdStr
      },
      select: {
        id: true,
        name: true,
        accountOfficerId: true,
        createdAt: true
      }
    });

    // Audit log
    if (userId) {
      await prisma.auditLog.create({
        data: {
          action: 'CREATE_BRANCH',
          details: JSON.stringify({ name, accountOfficerId: aoIdStr }),
          userId,
          entityId: newBranch.id
        }
      });
    }

    res.status(201).json(newBranch);
  } catch (error) {
    console.error('Error creating branch:', error);
    res.status(500).json({ error: 'Failed to create branch' });
  }
};

export const bulkCreateBranches = async (req, res) => {
  try {
    const branchesData = req.body; // Array of {name, accountOfficerId}
    const userId = req.user?.id;

    if (!Array.isArray(branchesData) || branchesData.length === 0) {
      return res.status(400).json({ error: 'Request body must be a non-empty array of branch objects' });
    }

    const validBranches = [];
    const errors = [];

    for (const [index, item] of branchesData.entries()) {
      const { name, accountOfficerId } = item;
      if (!name || !accountOfficerId) {
        errors.push(`Row ${index + 1}: Missing name or accountOfficerId`);
        continue;
      }
      const aoIdStr = String(accountOfficerId).trim();
      if (!/^\d{4}$/.test(aoIdStr)) {
        errors.push(`Row ${index + 1}: Invalid accountOfficerId (must be 4 digits)`);
        continue;
      }
      validBranches.push({ name: String(name).trim(), accountOfficerId: aoIdStr });
    }

    if (validBranches.length === 0) {
      return res.status(400).json({ error: 'No valid branches to create. Errors: ' + errors.join(', ') });
    }

    // Check for existing AO IDs (ensure strings)
    const aoIds = validBranches.map(b => b.accountOfficerId);
    const existing = await prisma.branch.findMany({ where: { accountOfficerId: { in: aoIds } } });
    const existingIds = new Set(existing.map(b => b.accountOfficerId));
    const duplicateErrors = validBranches.filter(b => existingIds.has(b.accountOfficerId)).map(b => `Account Officer ID ${b.accountOfficerId} already exists`);
    if (duplicateErrors.length > 0) {
      return res.status(409).json({ error: 'Duplicates found: ' + duplicateErrors.join(', ') });
    }

    // Create in transaction
    const createdBranches = await prisma.$transaction(async (tx) => {
      const created = [];
      for (const branchData of validBranches) {
        const newBranch = await tx.branch.create({
          data: branchData,
          select: {
            id: true,
            name: true,
            accountOfficerId: true,
            createdAt: true
          }
        });
        created.push(newBranch);

        // Audit log per branch
        if (userId) {
          await tx.auditLog.create({
            data: {
              action: 'CREATE_BRANCH_BULK',
              details: JSON.stringify(branchData),
              userId,
              entityId: newBranch.id
            }
          });
        }
      }
      return created;
    });

    res.status(201).json(createdBranches);
  } catch (error) {
    console.error('Error bulk creating branches:', error);
    res.status(500).json({ error: 'Failed to bulk create branches' });
  }
};

export const updateBranch = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, accountOfficerId } = req.body;
    const userId = req.user?.id;

    // Validate
    if (!name || !accountOfficerId) {
      return res.status(400).json({ error: 'Branch Name and Account Officer ID are required' });
    }
    const aoIdStr = String(accountOfficerId).trim();
    if (!/^\d{4}$/.test(aoIdStr)) {
      return res.status(400).json({ error: 'Account Officer ID must be exactly 4 digits' });
    }

    // Check if AO ID already exists (not self)
    const existingBranch = await prisma.branch.findUnique({ where: { accountOfficerId: aoIdStr } });
    if (existingBranch && existingBranch.id !== id) {
      return res.status(409).json({ error: 'Account Officer ID already exists' });
    }

    // Update
    const updatedBranch = await prisma.branch.update({
      where: { id },
      data: {
        name,
        accountOfficerId: aoIdStr
      },
      select: {
        id: true,
        name: true,
        accountOfficerId: true,
        updatedAt: true
      }
    });

    // Audit log
    if (userId) {
      await prisma.auditLog.create({
        data: {
          action: 'UPDATE_BRANCH',
          details: JSON.stringify({ name, accountOfficerId: aoIdStr }),
          userId,
          entityId: id
        }
      });
    }

    res.json(updatedBranch);
  } catch (error) {
    console.error('Error updating branch:', error);
    res.status(500).json({ error: 'Failed to update branch' });
  }
};

export const deleteBranch = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user?.id;

    // Check if branch has assignments (prevent delete if used)
    const assignmentCount = await prisma.assignment.count({ where: { branchId: id } });
    if (assignmentCount > 0) {
      return res.status(400).json({ error: 'Cannot delete branch with existing assignments' });
    }

    // Delete
    await prisma.branch.delete({ where: { id } });

    // Audit log
    if (userId) {
      await prisma.auditLog.create({
        data: {
          action: 'DELETE_BRANCH',
          userId,
          entityId: id
        }
      });
    }

    res.json({ message: 'Branch deleted successfully' });
  } catch (error) {
    console.error('Error deleting branch:', error);
    res.status(500).json({ error: 'Failed to delete branch' });
  }
};

export const getBranchById = async (req, res) => {
  try {
    const { id } = req.params;
    const branch = await prisma.branch.findUnique({
      where: { id },
      select: {
        id: true,
        name: true,
        accountOfficerId: true,
        createdAt: true
      }
    });
    if (!branch) {
      return res.status(404).json({ error: 'Branch not found' });
    }
    res.json(branch);
  } catch (error) {
    console.error('Error fetching branch:', error);
    res.status(500).json({ error: 'Failed to fetch branch' });
  }
};