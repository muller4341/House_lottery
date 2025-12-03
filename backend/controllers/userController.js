// controllers/userController.js

import { prisma } from '../utils/prismaClient.js'

export const getUsers = async (req, res) => {
  try {
    const { role } = req.query;
    const whereClause = {
      status: 0,  // Only active users
      ...(role && { role })
    };
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
    const userId = req.user?.id;

    if (!employeeId || !name || !role) {
      return res.status(400).json({ error: 'Employee ID, Name, and Role are required' });
    }

    const validRoles = ['OFFICER', 'TEAM_LEADER', 'CENTRAL_KYC_MANAGER'];
    if (!validRoles.includes(role)) {
      return res.status(400).json({ error: 'Invalid role specified' });
    }

    const existingUser = await prisma.user.findUnique({ where: { employeeId } });
    if (existingUser) {
      return res.status(409).json({ error: 'Employee ID already exists' });
    }

    const newUser = await prisma.user.create({
      data: {
        employeeId,
        name,
        role,
        phone: phone || null,
        status: 0
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

export const updateUser = async (req, res) => {
  try {
    const { id } = req.params;
    const { employeeId, name, role, phone } = req.body;
    const userId = req.user?.id;

    if (!employeeId || !name || !role) {
      return res.status(400).json({ error: 'Employee ID, Name, and Role are required' });
    }
    const validRoles = ['OFFICER', 'TEAM_LEADER', 'CENTRAL_KYC_MANAGER'];
    if (!validRoles.includes(role)) {
      return res.status(400).json({ error: 'Invalid role specified' });
    }

    const existingUser = await prisma.user.findUnique({ where: { employeeId } });
    if (existingUser && existingUser.id !== id) {
      return res.status(409).json({ error: 'Employee ID already exists' });
    }

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

// Soft Delete → Toggle status (0 <-> 1)
export const deleteUser = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user?.id;

    const targetUser = await prisma.user.findUnique({
      where: { id },
      select: { status: true, name: true }
    });

    if (!targetUser) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Prevent deletion if user has assignments
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

    const newStatus = targetUser.status === 0 ? 1 : 0;
    await prisma.user.update({
      where: { id },
      data: { status: newStatus }
    });

    const action = newStatus === 1 ? 'DEACTIVATE_USER' : 'REACTIVATE_USER';

    if (userId) {
      await prisma.auditLog.create({
        data: {
          action,
          details: JSON.stringify({ name: targetUser.name, newStatus }),
          userId,
          entityId: id
        }
      });
    }

    res.json({ message: 'User status updated successfully' });
  } catch (error) {
    console.error('Error toggling user status:', error);
    res.status(500).json({ error: 'Failed to update user status' });
  }
};

// GET CURRENT LOGGED-IN USER — /api/user/me
export const getCurrentUser = async (req, res) => {
  try {
    // verifyUser middleware already ran → req.user exists
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: "Not authenticated",
      });
    }

    // Return fresh user data from database (req.user comes from verifyUser)
    return res.status(200).json({
      success: true,
      user: {
        id: req.user._id,
        username: req.user.username,
        name: req.user.name,
        email: req.user.email,
        role: req.user.role,           // ← "MANAGER" or "OFFICER"
        employeeId: req.user.employeeId,
        department: req.user.department,
        // add any other fields you need
      },
    });
  } catch (error) {
    console.log("Error in getCurrentUser:", error);
    return res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
};

// ADD THIS TO YOUR EXISTING userController.js
export const logoutUser = async (req, res) => {
  try {
    // Clear the JWT cookie
    res.cookie('jwt', '', {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      expires: new Date(0),
    });

    res.status(200).json({ 
      success: true, 
      message: 'Logged out successfully' 
    });
  } catch (error) {
    console.error('Logout error:', error);
    res.status(500).json({ success: false, message: 'Logout failed' });
  }
};