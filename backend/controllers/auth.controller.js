import ldap from "ldapjs";
import jwt from "jsonwebtoken";
import { errorHandler } from "../utils/error.js";
import User from "../models/user.js";

const LDAP_SERVER = 'ldap://10.1.11.13:389';
const BASE_DN = 'DC=cbe,DC=com,DC=et';

export const signin = async (req, res, next) => {
  const { username, password } = req.body;

  console.log(`🔍 LOGIN ATTEMPT: username="${username}"`);

  if (!username || !password) {
    return next(errorHandler(400, "Username and password are required"));
  }

  let client;
  try {
    client = ldap.createClient({ url: LDAP_SERVER });
    
    const bindDn = `${username}@cbe.com.et`;
    console.log(`🔍 Binding with: ${bindDn}`);
    
    await new Promise((resolve, reject) => {
      client.bind(bindDn, password, (err) => {
        if (err) {
          console.log(`❌ BIND FAILED: ${err.lde_message || err.message}`);
          reject(err);
        } else {
          console.log(`✅ BIND SUCCESSFUL: ${bindDn}`);
          resolve();
        }
      });
    });

    // 🔥 🔥 🔥 MAGIC FIX: EMPTY attributes = ALL ATTRIBUTES + BETTER PERMISSIONS
    const searchOptions = {
      filter: `(sAMAccountName=${username})`,
      scope: 'sub',
      attributes: [],  // 🔥 EMPTY = ALL ATTRIBUTES (works better than ['*'])
      sizeLimit: 5,
      timeLimit: 10
    };

    console.log(`🔍 SEARCHING: ${searchOptions.filter} (attributes=ALL)`);

    const searchResult = await new Promise((resolve, reject) => {
      const entries = [];
      client.search(BASE_DN, searchOptions, (err, search) => {
        if (err) return reject(err);
        
        search.on('searchEntry', (entry) => {
          console.log('🔍 🎉 ENTRY FOUND!');
          console.log('   DN:', entry.dn.toString());
          
          if (entry.object) {
            // 🔥 LOG ALL AVAILABLE ATTRIBUTES
            const keys = Object.keys(entry.object);
            console.log('   TOTAL ATTRIBUTES:', keys.length);
            console.log('   ALL KEYS:', keys.slice(0, 15).join(', '));
            if (keys.length > 15) console.log('   ... +', keys.length - 15, 'more');
            
            // 🔥 LOG CRITICAL ONES
            console.log('   employeeID:', entry.object.employeeID);
            console.log('   displayName:', entry.object.displayName);
            console.log('   department:', entry.object.department);
            console.log('   title:', entry.object.title);
            console.log('   sAMAccountName:', entry.object.sAMAccountName);
            
            entries.push(entry.object);
          }
        });
        
        search.on('searchEntry', () => {
          // 🔥 This fires for EVERY entry - count them
          console.log('   📊 Entry received');
        });
        
        search.on('error', (err) => {
          console.log('🔍 SEARCH ERROR:', err.message);
          reject(err);
        });
        
        search.on('end', (result) => {
          console.log(`🔍 Search complete. Found ${entries.length} entries`);
          console.log('   Result status:', result.status);
          resolve(entries);
        });
      });
    });

    let ldapUser;
    
    if (searchResult.length > 0) {
      const userData = searchResult[0];
      const safeGet = (obj, prop) => {
        try {
          if (!obj || typeof obj !== 'object') return '';
          const value = obj[prop];
          if (Array.isArray(value) && value.length > 0) {
            return value[0];
          }
          return value || '';
        } catch {
          return '';
        }
      };

      ldapUser = {
        employeeId: safeGet(userData, 'employeeID') || 
                    safeGet(userData, 'description') || 
                    `CBE-${username}`,
        samAccountName: safeGet(userData, 'sAMAccountName') || username,
        displayName: safeGet(userData, 'displayName') || 
                     safeGet(userData, 'cn') || 
                     safeGet(userData, 'name') || username,
        fullName: `${safeGet(userData, 'givenName') || ''} ${safeGet(userData, 'sn') || ''}`.trim() || username,
        email: safeGet(userData, 'mail') || 
               safeGet(userData, 'userPrincipalName') || 
               `${username}@cbe.com.et`,
        department: safeGet(userData, 'department') || 'CBE',
        title: safeGet(userData, 'title') || 'CBE Employee',
        company: safeGet(userData, 'company') || 'CBE',
      };

      console.log('\n✅ 🎉 REAL LDAP DATA EXTRACTED!');
      console.log('   RAW employeeID:', safeGet(userData, 'employeeID'));
      console.log('   RAW displayName:', safeGet(userData, 'displayName'));
      console.log('   RAW department:', safeGet(userData, 'department'));
      console.log('   RAW title:', safeGet(userData, 'title'));
      
    } else {
      console.log('⚠️  NO LDAP DATA - Using basic profile');
      ldapUser = {
        employeeId: `CBE-${username}`,
        samAccountName: username,
        displayName: username,
        fullName: username,
        email: `${username}@cbe.com.et`,
        department: 'CBE',
        title: 'CBE Employee',
        company: 'CBE',
      };
    }

    console.log('\n✅ FINAL LDAP USER:');
    console.table(ldapUser);

    // Database...
    let user = await User.findOne({ 
      $or: [
        { samAccountName: ldapUser.samAccountName },
        { email: ldapUser.email },
        { employeeId: ldapUser.employeeId }
      ] 
    });
    
    if (!user) {
      user = new User({
        employeeId: ldapUser.employeeId,
        samAccountName: ldapUser.samAccountName,
        displayName: ldapUser.displayName,
        fullName: ldapUser.fullName,
        email: ldapUser.email,
        department: ldapUser.department,
        title: ldapUser.title,
        company: ldapUser.company,
        isAdmin: false,
      });
      await user.save();
      console.log('✅ NEW USER CREATED:', user._id);
    }

    console.log('\n🎉 LOGIN SUCCESSFUL!');
    console.table({
      '🆔 Employee ID': ldapUser.employeeId,
      '👤 Display Name': ldapUser.displayName,
      '📧 Email': ldapUser.email,
      '🏢 Department': ldapUser.department,
      '📋 Title': ldapUser.title,
      '👑 Role': user.isAdmin ? 'ADMIN' : 'USER',
    });

    // JWT + Response
    const token = jwt.sign(
      { 
        id: user._id, 
        employeeId: user.employeeId,
        samAccountName: user.samAccountName,
        displayName: user.displayName,
        fullName: user.fullName,
        isAdmin: user.isAdmin 
      },
      process.env.JWT_SECRET,
      { expiresIn: "7d" }
    );

    const { password: _, ...userInfo } = user._doc;

    res
      .cookie("access_token", token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: 'strict',
        maxAge: 7 * 24 * 60 * 60 * 1000,
      })
      .status(200)
      .json({
        success: true,
        message: "Login successful",
        user: {
          id: userInfo._id,
          employeeId: userInfo.employeeId || ldapUser.employeeId,
          displayName: ldapUser.displayName,
          fullName: ldapUser.fullName,
          email: ldapUser.email,
          department: ldapUser.department,
          title: userInfo.title || ldapUser.title,
          isAdmin: userInfo.isAdmin || false,
        },
      });

  } catch (error) {
    console.log("💥 ERROR:", error.message);
    if (error.lde_message) console.log("💥 LDAP ERROR:", error.lde_message);
    next(errorHandler(500, "Authentication failed"));
  } finally {
    if (client) {
      try {
        client.unbind();
      } catch (e) {}
    }
  }
};

export const signout = async (req, res, next) => {
  try {
    res
      .clearCookie("access_token")
      .status(200)
      .json({ success: true, message: "Logout successful" });
  } catch (error) {
    next(error);
  }
};