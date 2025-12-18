// routes/users.route.js
import express from 'express';
import { getUsers, createUser, updateUser, deleteUser, getMe ,logoutUser, getActiveUsers  } from '../controllers/userController.js';
import verifyUser from '../utils/verifyUser.js';

const router = express.Router();

router.get('/', getUsers);
router.get('/active', getActiveUsers);
router.post('/', createUser);
router.put('/:id', updateUser);
router.delete('/:id', deleteUser);
router.get('/me', verifyUser, getMe);
router.post('/logout', logoutUser);  

export default router;