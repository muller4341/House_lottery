// controllers/userController.js
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

    // Validate required fields
    if (!employeeId || !name || !role) {
      return res.status(400).json({ error: 'Employee ID, Name, and Role are required' });
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

    res.status(201).json(newUser);
  } catch (error) {
    console.error('Error creating user:', error);
    res.status(500).json({ error: 'Failed to create user' });
  }
};