
// import jwt from 'jsonwebtoken';
// import { prisma } from '../utils/prismaClient.js';
// import { errorHandler } from './error.js';

// export default async (req, res, next) => {
//   const token = req.cookies.access_token || req.header('Authorization')?.replace('Bearer ', '');

//   if (!token) {
//     console.log("ACCESS DENIED → No token");
//     return next(errorHandler(401, 'Unauthorized'));
//   }

//   try {
//     // 1. Decode token to get employeeId
//     const decoded = jwt.verify(token, process.env.JWT_SECRET || "cbe-kyc-secret-2025");

//     // 2. GET FRESH USER FROM DATABASE (latest role!)
//     const freshUser = await prisma.user.findUnique({
//       where: { employeeId: decoded.employeeId },
//       select: { id: true, employeeId: true, name: true, role: true, phone: true }
//     });

//     if (!freshUser) {
//       return next(errorHandler(401, 'User not found'));
//     }

//     // 3. Attach fresh user data to request (with latest role!)
//     req.user = {
//       id: freshUser.id,
//       employeeId: freshUser.employeeId,
//       name: freshUser.name,
//       role: freshUser.role,        // ← THIS IS ALWAYS UP-TO-DATE!
//       phone: freshUser.phone
//     };

//     console.log("USER VERIFIED (LATEST FROM DB)");
//     console.log("┌──────────────────────────────────────────");
//     console.log(`│ Name       : ${req.user.name}`);
//     console.log(`│ EmployeeID : ${req.user.employeeId}`);
//     console.log(`│ Role       : ${req.user.role} ← FROM DATABASE`);
//     console.log("└──────────────────────────────────────────");

//     next();
//   } catch (error) {
//     console.log("INVALID TOKEN →", error.message);
//     return next(errorHandler(403, 'Invalid or expired token'));
//   }
// };

import jwt from 'jsonwebtoken';
import { prisma } from '../utils/prismaClient.js';
import { errorHandler } from './error.js';

export default async (req, res, next) => {
  const token = req.cookies.access_token || req.header('Authorization')?.replace('Bearer ', '');

  if (!token) {
    console.log("ACCESS DENIED → No token");
    return next(errorHandler(401, 'Unauthorized'));
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET || "cbe-kyc-secret-2025");

    // WAIT UNTIL USER IS IN DB (first-time login fix)
    let freshUser = null;
    for (let i = 0; i < 10; i++) {
      freshUser = await prisma.user.findUnique({
        where: { employeeId: decoded.employeeId },
        select: { id: true, employeeId: true, name: true, role: true, phone: true }
      });
      if (freshUser) break;
      await new Promise(r => setTimeout(r, 300));
    }

    if (!freshUser) {
      console.log(`USER NOT FOUND IN DB AFTER RETRY → employeeId: ${decoded.employeeId}`);
      return next(errorHandler(401, 'User not found'));
    }

    req.user = {
      id: freshUser.id,
      employeeId: freshUser.employeeId,
      name: freshUser.name,
      role: freshUser.role,
      phone: freshUser.phone
    };

    console.log("USER VERIFIED (LATEST FROM DB)");
    console.log("┌──────────────────────────────────────────");
    console.log(`│ Name       : ${req.user.name}`);
    console.log(`│ EmployeeID : ${req.user.employeeId}`);
    console.log(`│ Role       : ${req.user.role} ← FROM DATABASE`);
    console.log("└──────────────────────────────────────────");

    next();
  } catch (error) {
    console.log("INVALID TOKEN →", error.message);
    return next(errorHandler(403, 'Invalid or expired token'));
  }
};