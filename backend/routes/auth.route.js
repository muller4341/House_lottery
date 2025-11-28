import express from 'express';

import { signout, signin  } from '../controllers/auth.controller.js';
import verifyUser from '../utils/verifyUser.js'

const router = express.Router();

router.post('/signout',signout )
router.post('/signin',signin )
router.get("/verify", verifyUser, (req, res) => {
  res.status(200).json({
    success: true,
    user: req.user   // req.user is already set by verifyUser middleware
  });
});

export default router;