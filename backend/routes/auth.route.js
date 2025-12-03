// import express from 'express';

// import {signin  } from '../controllers/auth.controller.js';
// import verifyUser from '../utils/verifyUser.js'

// const router = express.Router();
// router.post('/signin', verifyUser, signin )
// router.get("/verify", verifyUser, (req, res) => {
//   res.status(200).json({
//     success: true,
//     user: req.user,
//     employeeId: req.user.employeeId
//        // req.user is already set by verifyUser middleware
//   });
// });

// export default router;
import express from 'express';
import { signin } from '../controllers/auth.controller.js';
import verifyUser from '../utils/verifyUser.js';

const router = express.Router();

// SMART MIDDLEWARE — verifyUser only runs if token exists AND user is already in DB
const optionalVerifyUser = async (req, res, next) => {
  const token = req.cookies.access_token || req.header('Authorization')?.replace('Bearer ', '');

  if (!token) {
    // No token → first-time login → skip verification
    return next();
  }

  try {
    // Token exists → try to verify (second-time login)
    await verifyUser(req, res, () => {
      // If verifyUser succeeds → user is authenticated → skip signin controller
      if (req.user) {
        return res.json({
          success: true,
          message: "Already logged in",
          user: req.user
        });
      }
      next(); // verifyUser failed → continue to signin
    });
  } catch {
    next(); // any error → continue to signin
  }
};

// FINAL ROUTE — ONE LINE DOES EVERYTHING
router.post('/signin', optionalVerifyUser, signin);

export default router;