
// import express from 'express';
// import { signin } from '../controllers/auth.controller.js';
// import verifyUser from '../utils/verifyUser.js';

// const router = express.Router();

// // SMART MIDDLEWARE — verifyUser only runs if token exists AND user is already in DB
// const optionalVerifyUser = async (req, res, next) => {
//   const token = req.cookies.access_token || req.header('Authorization')?.replace('Bearer ', '');

//   if (!token) {
//     // No token → first-time login → skip verification
//     return next();
//   }

//   try {
//     // Token exists → try to verify (second-time login)
//     await verifyUser(req, res, () => {
//       // If verifyUser succeeds → user is authenticated → skip signin controller
//       if (req.user) {
//         return res.json({
//           success: true,
//           message: "Already logged in",
//           user: req.user
//         });
//       }
//       next(); // verifyUser failed → continue to signin
//     });
//   } catch {
//     next(); // any error → continue to signin
//   }
// };

// // FINAL ROUTE — ONE LINE DOES EVERYTHING
// router.post('/signin', optionalVerifyUser, signin);

// export default router;
// routes/auth.route.js
import { signin } from '../controllers/auth.controller.js';
import verifyUser from '../utils/verifyUser.js';
import express from 'express';

const router = express.Router();

// THIS IS THE CORRECT "remember me" middleware
const rememberMeLogin = async (req, res, next) => {
  const token = req.cookies.access_token;

  // No token → definitely first-time → go to LDAP
  if (!token) return next();

  try {
    await verifyUser(req, res, async () => {
      if (!req.user) return next();

      // NEW: Check if username in request body matches the token owner
      const { username } = req.body || {};

      if (username && req.user.employeeId !== `CBE-${username}` && req.user.employeeId !== username) {
        // Different person trying to log in but old cookie exists
        // → Clear cookie and force full LDAP login
        res.clearCookie("access_token");
        return next();
      }

      // Same person → auto-login from DB (fast!)
      return res.json({
        success: true,
        message: "Welcome back!",
        user: req.user
      });
    });
  } catch (err) {
    res.clearCookie("access_token");
    next();
  }
};

// ONE PERFECT ROUTE
router.post('/signin', rememberMeLogin, signin);

export default router;