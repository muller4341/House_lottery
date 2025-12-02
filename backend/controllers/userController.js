// controllers/userController.js
// Updated: Removed ACCOUNT_OFFICER from validRoles (non-relational ID only).
// Retained audit logging on create.
// Enhanced professional error responses.
// Added: updateUser, deleteUser (with validation, unique check, prevent delete if assigned, audit).

import { prisma } from '../utils/prismaClient.js'

export const getUsers = async (req, res) => {
  try {
    const { role } = req.query;
    const whereClause = role ? { role } : {};
    const users = await prisma.user.findMany({
      where: whereClause,
      select: {
        id: true,
        employeeId: true,
        name: true,
        role: true,
        phone: true,
        createdAt: true
      },
      orderBy: { name: 'asc' }
    });
    res.json(users);
  } catch (error) {
    console.error('Error fetching users:', error);
    res.status(500).json({ error: 'Failed to fetch users' });
  }
};

export const createUser = async (req, res) => {
  try {
    const { employeeId, name, role, phone } = req.body;
    const userId = req.user?.id;  // Assume from auth middleware

    // Validate required fields
    if (!employeeId || !name || !role) {
      return res.status(400).json({ error: 'Employee ID, Name, and Role are required' });
    }

    // Validate role enum (removed ACCOUNT_OFFICER)
    const validRoles = ['OFFICER', 'TEAM_LEADER', 'CENTRAL_KYC_MANAGER'];
    if (!validRoles.includes(role)) {
      return res.status(400).json({ error: 'Invalid role specified' });
    }

    // Check if employeeId already exists
    const existingUser = await prisma.user.findUnique({ where: { employeeId } });
    if (existingUser) {
      return res.status(409).json({ error: 'Employee ID already exists' });
    }

    // Create user
    const newUser = await prisma.user.create({
      data: {
        employeeId,
        name,
        role,
        phone: phone || null
      },
      select: {
        id: true,
        employeeId: true,
        name: true,
        role: true,
        phone: true,
        createdAt: true
      }
    });

    // Log audit (Manager/Admin only, assume check)
    if (userId) {
      await prisma.auditLog.create({
        data: {
          action: 'CREATE_USER',
          details: JSON.stringify({ employeeId, role }),
          userId,
          entityId: newUser.id
        }
      });
    }

    res.status(201).json(newUser);
  } catch (error) {
    console.error('Error creating user:', error);
    res.status(500).json({ error: 'Failed to create user' });
  }
};

// New: Update
export const updateUser = async (req, res) => {
  try {
    const { id } = req.params;
    const { employeeId, name, role, phone } = req.body;
    const userId = req.user?.id;

    // Validate
    if (!employeeId || !name || !role) {
      return res.status(400).json({ error: 'Employee ID, Name, and Role are required' });
    }
    const validRoles = ['OFFICER', 'TEAM_LEADER', 'CENTRAL_KYC_MANAGER'];
    if (!validRoles.includes(role)) {
      return res.status(400).json({ error: 'Invalid role specified' });
    }

    // Check if employeeId already exists (not self)
    const existingUser = await prisma.user.findUnique({ where: { employeeId } });
    if (existingUser && existingUser.id !== id) {
      return res.status(409).json({ error: 'Employee ID already exists' });
    }

    // Update
    const updatedUser = await prisma.user.update({
      where: { id },
      data: {
        employeeId,
        name,
        role,
        phone: phone || null
      },
      select: {
        id: true,
        employeeId: true,
        name: true,
        role: true,
        phone: true,
        updatedAt: true
      }
    });

    // Audit log
    if (userId) {
      await prisma.auditLog.create({
        data: {
          action: 'UPDATE_USER',
          details: JSON.stringify({ employeeId, role }),
          userId,
          entityId: id
        }
      });
    }

    res.json(updatedUser);
  } catch (error) {
    console.error('Error updating user:', error);
    res.status(500).json({ error: 'Failed to update user' });
  }
};

// New: Delete
export const deleteUser = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user?.id;

    // Check if user has assignments (prevent delete if used)
    const assignmentCount = await prisma.assignment.count({
      where: {
        OR: [
          { officer1Id: id },
          { officer2Id: id },
          { tl1Id: id },
          { tl2Id: id }
        ]
      }
    });
    if (assignmentCount > 0) {
      return res.status(400).json({ error: 'Cannot delete user with existing assignments' });
    }

    // Delete
    await prisma.user.delete({ where: { id } });

    // Audit log
    if (userId) {
      await prisma.auditLog.create({
        data: {
          action: 'DELETE_USER',
          userId,
          entityId: id
        }
      });
    }

    res.json({ message: 'User deleted successfully' });
  } catch (error) {
    console.error('Error deleting user:', error);
    res.status(500).json({ error: 'Failed to delete user' });
  }
};