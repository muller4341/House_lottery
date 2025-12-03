
// import { Client } from 'ldapts';
// import jwt from "jsonwebtoken";
// import ldap from "ldapjs";
// import dotenv from "dotenv";
// dotenv.config();

// const LDAP_SERVER = process.env.LDAP_SERVER;
// const JWT_SECRET = process.env.JWT_SECRET;

// const LDAP_URL = 'ldap://10.1.11.13:389';
// const BASE_DN = 'DC=cbe,DC=com,DC=et';

// export const signin = async (req, res) => {
//   const { username, password } = req.body;

//   if (!username || !password) {
//     return res.status(400).json({
//       success: false,
//       message: "Username and password required",
//     });
//   }

//   const client = new Client({ url: LDAP_URL });

//   try {
//     await client.bind(`${username}@cbe.com.et`, password);
//     console.log(`LDAP BIND SUCCESS → ${username}@cbe.com.et`);

//     const { searchEntries } = await client.search(BASE_DN, {
//       scope: 'sub',
//       filter: `(sAMAccountName=${username})`,
//       attributes: ['employeeID', 'displayName', 'telephoneNumber', 'mobile', 'title']
//     });

//     const ldapUser = searchEntries[0] || {};

//     const getAttr = (attr) => {
//       const value = ldapUser[attr];
//       if (!value) return null;
//       if (Array.isArray(value)) return value.length > 0 ? value[0] : null;
//       return value;
//     };

//     const employeeId = getAttr('employeeID') || `CBE-${username}`;
//     const name = getAttr('displayName') || getAttr('cn') || username;
//     const phone = getAttr('telephoneNumber') || getAttr('mobile');

//     // FINAL UPSERT — ROLE IS NEVER TOUCHED ON UPDATE!
//     const user = await prisma.user.upsert({
//       where: { employeeId },
//       update: {
//         name,
//         phone
//         // ← role is NOT here → IT WILL OVERWRITE!
//       },
//       create: {
//         employeeId,
//         name,
//         phone,
//         role: "USER"   // only first time
//       }
//     });

//     // THIS IS THE KEY — GET ROLE FROM DB, NEVER FROM LDAP
//     const roleFromDB = user.role;

//     // ← this is the real role

//     console.log(`LOGIN SUCCESS → ${name} (${employeeId}) | Role: ${roleFromDB} ← FROM DATABASE`);

//     const token = jwt.sign(
//       { 
//         id: user.id, 
//         employeeId: user.employeeId, 
//         name: user.name, 
//         role: roleFromDB 
//       },
//       process.env.JWT_SECRET || "cbe-kyc-secret-2025",
//       { expiresIn: "7d" }
//     );

//     console.log("JWT TOKEN GENERATED:");
//     console.log(token);

//     await client.unbind();

//     return res.cookie("access_token", token, {
//       httpOnly: true,
//       secure: true,
//       sameSite: "strict",
//       maxAge: 7 * 24 * 60 * 60 * 1000
//     }).json({
//       success: true,
//       message: "Welcome to CBE KYC",
//       user: { ...user, role: roleFromDB }
//     });

//   } catch (error) {
//     console.log("LDAP ERROR →", error.message);
//     await client.unbind().catch(() => {});
//     return res.status(401).json({
//       success: false,
//       message: "Invalid CBE username or password"
//     });
//   }
// };


// controllers/authController.js  ← REPLACE YOUR ENTIRE signin FUNCTION WITH THIS
import jwt from "jsonwebtoken";
import { prisma } from "../utils/prismaClient.js";

export const signin = async (req, res) => {
  const { employeeId } = req.body;

  // 1. Must send employeeId
  if (!employeeId || employeeId.toString().trim() === "") {
    return res.status(400).json({
      success: false,
      message: "Employee ID is required",
    });
  }

  try {
    // 2. SEARCH EXACTLY — case sensitive, no extra spaces
    const user = await prisma.user.findUnique({
      where: {
        employeeId: employeeId.toString().trim(),
      },
    });

    // 3. THIS IS THE MOST IMPORTANT LINE — BLOCK IF NOT FOUND
    if (!user) {
      console.log(`LOGIN BLOCKED → employeeId "${employeeId}" not found in database`);
      return res.status(401).json({
        success: false,
        message: "Invalid Employee ID. User not registered.",
      });
    }

    // 4. Check if account is active
    if (user.status !== 0) {
      return res.status(403).json({
        success: false,
        message: "Account is deactivated",
      });
    }

    // 5. Generate fresh token
    const token = jwt.sign(
      {
        id: user.id,
        employeeId: user.employeeId,
        name: user.name,
        role: user.role,
      },
      process.env.JWT_SECRET || "cbe-kyc-secret-2025",
      { expiresIn: "7d" }
    );

    // 6. CLEAR OLD COOKIE FIRST → prevents old user leak!
    res.clearCookie("access_token", {
      httpOnly: true,
      sameSite: "strict",
      secure: process.env.NODE_ENV === "production",
      path: "/",
    });

    // 7. Set new cookie
    res.cookie("access_token", token, {
      httpOnly: true,
      sameSite: "strict",
      secure: process.env.NODE_ENV === "production",
      maxAge: 7 * 24 * 60 * 60 * 1000,
      path: "/",
    });

    console.log(`LOGIN SUCCESS → ${user.name} (${user.employeeId}) - Role: ${user.role}`);

    return res.json({
      success: true,
      message: "Login successful",
      user: {
        id: user.id,
        employeeId: user.employeeId,
        name: user.name,
        role: user.role,
      },
    });
  } catch (error) {
    console.error("Signin error:", error);
    return res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
};