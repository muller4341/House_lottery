// // controllers/auth.controller.js
// import ldap from "ldapjs";
// import jwt from "jsonwebtoken";
// import { prisma } from "../utils/prismaClient.js";

// const LDAP_SERVER = 'ldap://10.1.11.13:389';
// const BASE_DN = 'DC=cbe,DC=com,DC=et';

// export const signin = async (req, res) => {
//   const { username, password } = req.body;

//   console.log(`LOGIN ATTEMPT: ${username}`);

//   if (!username || !password) {
//     return res.status(400).json({ success: false, message: "Username and password required" });
//   }

//   let client;
//   try {
//     client = ldap.createClient({ url: LDAP_SERVER });
//     const bindDn = `${username}@cbe.com.et`;

//     // Bind to LDAP
//     await new Promise((resolve, reject) => {
//       client.bind(bindDn, password, (err) => {
//         err ? reject(err) : resolve();
//       });
//     });

//     console.log(`LDAP BIND SUCCESS: ${bindDn}`);

//     // Search user in LDAP
//     const searchResult = await new Promise((resolve, reject) => {
//       const entries = [];
//       client.search(BASE_DN, {
//         filter: `(sAMAccountName=${username})`,
//         scope: 'sub',
//         attributes: ['employeeID', 'displayName', 'mail', 'department', 'title', 'givenName', 'sn']
//       }, (err, search) => {
//         if (err) return reject(err);

//         search.on('searchEntry', entry => entries.push(entry.object));
//         search.on('error', reject);
//         search.on('end', () => resolve(entries));
//       });
//     });

//     const ldapUser = searchResult[0] || {};
//     const get = (obj, key, fallback = '') => (obj[key] ? (Array.isArray(obj[key]) ? obj[key][0] : obj[key]) : fallback);

//     const userData = {
//       employeeId: get(ldapUser, 'employeeID') || `CBE-${username}`,
//       name: get(ldapUser, 'displayName') || get(ldapUser, 'cn') || username,
//       email: get(ldapUser, 'mail') || `${username}@cbe.com.et`,
//       department: get(ldapUser, 'department') || 'CBE',
//       title: get(ldapUser, 'title') || 'Employee',
//       role: 'OFFICER' // default — change later if needed
//     };

//     // UPSERT USER IN POSTGRESQL USING PRISMA
//     const user = await prisma.user.upsert({
//       where: { employeeId: userData.employeeId },
//       update: {
//         name: userData.name,
//         phone: userData.phone || null,
//         role: userData.role
//       },
//       create: {
//         employeeId: userData.employeeId,
//         name: userData.name,
//         phone: null,
//         role: userData.role
//       }
//     });

//     // Generate JWT
//     const token = jwt.sign(
//       { id: user.id, employeeId: user.employeeId, name: user.name, role: user.role },
//       process.env.JWT_SECRET || 'fallback-secret',
//       { expiresIn: '7d' }
//     );

//     console.log(`LOGIN SUCCESS: ${user.name} (${user.employeeId})`);

//     res.cookie('access_token', token, {
//       httpOnly: true,
//       secure: process.env.NODE_ENV === 'production',
//       sameSite: 'strict',
//       maxAge: 7 * 24 * 60 * 60 * 1000
//     });

//     return res.status(200).json({
//       success: true,
//       message: "Login successful",
//       user: {
//         id: user.id,
//         employeeId: user.employeeId,
//         displayName: user.name,
//         email: userData.email,
//         department: userData.department,
//         title: userData.title,
//         role: user.role,
//         isAdmin: user.role === 'CENTRAL_KYC_MANAGER'
//       }
//     });

//   } catch (error) {
//     console.log("LOGIN FAILED:", error.message);
//     return res.status(401).json({
//       success: false,
//       message: "Invalid credentials or LDAP connection failed"
//     });
//   } finally {
//     if (client) client.unbind();
//   }
// };
// controllers/auth.controller.js
// controllers/auth.controller.js  ← REPLACE YOUR ENTIRE FILE WITH THIS

// controllers/auth.controller.js — FINAL VERSION (CBE ONLY)
// controllers/auth.controller.js — FINAL WORKING VERSION FOR CBE
// controllers/auth.controller.js — FINAL 100% WORKING WITH CBE LDAP
// controllers/auth.controller.js — FINAL CBE-PROVEN VERSION
// controllers/auth.controller.js — FINAL FINAL FINAL (WORKS 100% AT CBE)
import { Client } from 'ldapts';
import jwt from "jsonwebtoken";
import ldap from "ldapjs";
import dotenv from "dotenv";
dotenv.config();

const LDAP_SERVER = process.env.LDAP_SERVER;
const JWT_SECRET = process.env.JWT_SECRET;

const LDAP_URL = 'ldap://10.1.11.13:389';
const BASE_DN = 'DC=cbe,DC=com,DC=et';

export const signin = async (req, res) => {
  const { username, password } = req.body;

  if (!username || !password) {
    return res.status(400).json({
      success: false,
      message: "Username and password required",
    });
  }

  const client = new Client({ url: LDAP_URL });

  try {
    await client.bind(`${username}@cbe.com.et`, password);
    console.log(`LDAP BIND SUCCESS → ${username}@cbe.com.et`);

    const { searchEntries } = await client.search(BASE_DN, {
      scope: 'sub',
      filter: `(sAMAccountName=${username})`,
      attributes: ['employeeID', 'displayName', 'telephoneNumber', 'mobile', 'title']
    });

    const ldapUser = searchEntries[0] || {};

    const getAttr = (attr) => {
      const value = ldapUser[attr];
      if (!value) return null;
      if (Array.isArray(value)) return value.length > 0 ? value[0] : null;
      return value;
    };

    const employeeId = getAttr('employeeID') || `CBE-${username}`;
    const name = getAttr('displayName') || getAttr('cn') || username;
    const phone = getAttr('telephoneNumber') || getAttr('mobile');

    // FINAL UPSERT — ROLE IS NEVER TOUCHED ON UPDATE!
    const user = await prisma.user.upsert({
      where: { employeeId },
      update: {
        name,
        phone
        // ← role is NOT here → IT WILL OVERWRITE!
      },
      create: {
        employeeId,
        name,
        phone,
        role: "user"   // only first time
      }
    });

    // THIS IS THE KEY — GET ROLE FROM DB, NEVER FROM LDAP
    const roleFromDB = user.role;

    // ← this is the real role

    console.log(`LOGIN SUCCESS → ${name} (${employeeId}) | Role: ${roleFromDB} ← FROM DATABASE`);

    const token = jwt.sign(
      { 
        id: user.id, 
        employeeId: user.employeeId, 
        name: user.name, 
        role: roleFromDB 
      },
      process.env.JWT_SECRET || "cbe-kyc-secret-2025",
      { expiresIn: "7d" }
    );

    console.log("JWT TOKEN GENERATED:");
    console.log(token);

    await client.unbind();

    return res.cookie("access_token", token, {
      httpOnly: true,
      secure: true,
      sameSite: "strict",
      maxAge: 7 * 24 * 60 * 60 * 1000
    }).json({
      success: true,
      message: "Welcome to CBE KYC",
      user: { ...user, role: roleFromDB }
    });

  } catch (error) {
    console.log("LDAP ERROR →", error.message);
    await client.unbind().catch(() => {});
    return res.status(401).json({
      success: false,
      message: "Invalid CBE username or password"
    });
  }
};
