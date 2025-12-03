import express from 'express';

import {signin  } from '../controllers/auth.controller.js';
import verifyUser from '../utils/verifyUser.js'

const router = express.Router();
router.post('/signin', verifyUser, signin )
router.get("/verify", verifyUser, (req, res) => {
  res.status(200).json({
    success: true,
    user: req.user,
    employeeId: req.user.employeeId
       // req.user is already set by verifyUser middleware
  });
});

export default router;