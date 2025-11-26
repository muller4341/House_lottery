import express from 'express';

import { signup, signin  } from '../controllers/auth.js';
import verifyUser from '../utils/verifyUser.js'

const router = express.Router();

router.post('/signup',signup )
router.post('/signin',signin )
router.get("/verify", verifyUser, (req, res) => {
  res.status(200).json({
    success: true,
    user: req.user   // req.user is already set by verifyUser middleware
  });
});

export default router;