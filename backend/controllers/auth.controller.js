// // controllers/auth.controller.js
// import ldap from "ldapjs";
// import jwt from "jsonwebtoken";
// import { prisma } from "../utils/prismaClient.js";

// const LDAP_SERVER = 'ldap://10.1.11.13:389'; // CBE LDAP server port=636
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

import jwt from "jsonwebtoken";
import ldap from "ldapjs";
import dotenv from "dotenv";
dotenv.config();

const LDAP_SERVER = process.env.LDAP_SERVER;
const JWT_SECRET = process.env.JWT_SECRET;

// ----------------------------------------------------

export const signin = async (req, res) => {
  const { username, password } = req.body;

  console.log(`LOGIN ATTEMPT: ${username}`);

  if (!username || !password) {
    return res.status(400).json({
      success: false,
      message: "Username and password required",
    });
  }

  // ----------------------------------------------------
  // ✅ TEMPORARY DEV BYPASS
  // ----------------------------------------------------
console.log("NODE ENV:", process.env.NODE_ENV);

// DEV BYPASS
if (process.env.NODE_ENV !== "production") {
  if (username === "dev") {

    console.log("DEV MODE LOGIN USED");

    const user = {
      id: "dev-user-1",
      email: "dev@test.com",
      role: "admin",
    };

    const token = jwt.sign(user, process.env.JWT_SECRET, {
      expiresIn: "1d",
    });

    return res.json({
      success: true,
      message: "Logged in using DEV mode",
      token,
      user,
    });
  }
}


  // ----------------------------------------------------
  // LDAP LOGIN
  // ----------------------------------------------------

  let client;

  try {
    client = ldap.createClient({ url: LDAP_SERVER });

    const bindDn = `${username}@cbe.com.et`;

    // LDAP bind
    await new Promise((resolve, reject) => {
      client.bind(bindDn, password, (err) => {
        if (err) {
          console.log("LDAP BIND FAILED:", err.message);
          return reject("Invalid username or password");
        }
        resolve();
      });
    });

    console.log(`LDAP BIND SUCCESS: ${bindDn}`);

    // ----------------------------------------------------
    // Example: Build user object (you can modify this)
    // ----------------------------------------------------

    const user = {
      id: username,
      email: `${username}@cbe.com.et`,
      role: "user",
    };

    // Sign JWT token
    const token = jwt.sign(user, JWT_SECRET, { expiresIn: "1d" });

    return res.json({
      success: true,
      message: "Login successful",
      token,
      user,
    });

  } catch (err) {
    console.error("LOGIN ERROR:", err);

    return res.status(401).json({
      success: false,
      message: "Authentication failed",
      error: err.toString(),
    });

  } finally {
    if (client) client.unbind();
  }
};
