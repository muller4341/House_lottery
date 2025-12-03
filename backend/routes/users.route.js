// routes/users.route.js
import express from 'express';
import { getUsers, createUser, updateUser, deleteUser, getCurrentUser ,logoutUser } from '../controllers/userController.js';
import verifyUser from '../utils/verifyUser.js';

const router = express.Router();

router.get('/', getUsers);
router.post('/', createUser);
router.put('/:id', updateUser);
router.delete('/:id', deleteUser);
router.get('/me', verifyUser, getCurrentUser);
router.post('/logout', logoutUser);  

export default router;