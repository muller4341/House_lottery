import bcrypt from 'bcryptjs';
import { errorHandler } from '../utils/error.js';
import User from '../model/user.js';
import { parse } from 'path';


const updateUser = async (req, res) => {
  try {
    const { firstname, lastname, phoneNumber, role, location } = req.body;
    const userId = req.params.userId;

    // Validate input
    if (!firstname || !lastname || !phoneNumber || !role) {
      return res.status(400).json({ message: "All fields are required" });
    }


    // Validate phone number format (basic validation)
    const phoneRegex = /^\+?[\d\s-]{10,}$/;
    if (!phoneRegex.test(phoneNumber)) {
      return res.status(400).json({ message: "Invalid phone number format" });
    }

    // Validate role
    const validRoles = ["admin", "finance", "marketing", "production","dispatcher"];
    if (!validRoles.includes(role.toLowerCase())) {
      return res.status(400).json({ message: "Invalid role" });
    }

    // Validate location for production role
    if (role.toLowerCase() === "production" && !location) {
      return res.status(400).json({ message: "Production employees must have a valid location" });
    }

    // Check if user exists
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

  

    // Update user
    const updatedUser = await User.findByIdAndUpdate(
      userId,
      {
        firstname,
        lastname,
        phoneNumber,
        role: role.toLowerCase(),
        ...(role.toLowerCase() === "production" && { location }), // Only include location for production role
      },
      { new: true }
    ).select("-password");

    res.status(200).json({
      message: "User updated successfully",
      user: updatedUser,
    });
  } catch (error) {
    console.log("Error in updateUser controller: ", error.message);
    res.status(500).json({ message: "Internal server error" });
  }
}; 

const deleteUser = async (req, res, next) => {  

    if(!req.user.isAdmin && req.user.id!==req.params.userId){
        return next(errorHandler(403, 'you are not allowed to delete this account,you can delete only your account'));

    }
        try {
            await User.findByIdAndDelete(req.params.userId);
            res.status(200).json('Account has been deleted successfully');
        }
        catch (error) {
            next(error);
        }
        

}
;

const signOut = ( req, res, next) => {
      try {
        res.clearCookie('token')
        res.status(200)
        .json('user signed out successfully');                                  
       }
         catch (error) {
              next(error);
         }
};

const getEmployees = async (req, res, next) => {
    const allowedRoles = ["admin", "finance", "marketing", "production", "cashier", "dispatcher"];

    if (!req.user.isAdmin) {
        return next(errorHandler(403, 'You are not allowed to get all users'));
    }

    try {
        const sortDirection = req.query.sort === 'asc' ? 1 : -1;

        let query = User.find({ role: { $in: allowedRoles } }).sort({ createdAt: sortDirection });

        // Apply pagination only if query params exist
        if (req.query.startIndex || req.query.limit) {
            const startIndex = parseInt(req.query.startIndex) || 0;
            const limit = parseInt(req.query.limit) || 6;
            query = query.skip(startIndex).limit(limit);
        }

        const users = await query;

        const userWithoutPassword = users.map(user => {
            const { password, ...rest } = user._doc;
            return rest;
        });

        const totalUsers = await User.countDocuments({ role: { $in: allowedRoles } });

        const now = new Date();
        const oneMonthAgo = new Date(now.getFullYear(), now.getMonth() - 1, now.getDate());

        const lastMonthUsers = await User.countDocuments({
            role: { $in: allowedRoles },
            createdAt: { $gte: oneMonthAgo }
        });

        res.status(200).json({
            users: userWithoutPassword,
            totalUsers,
            lastMonthUsers
        });

    } catch (error) {
        next(error);
    }
};

const getCustomers = async (req, res, next) => {
    const allowedRoles = ["customer"];
    if(!req.user.isAdmin){
        return next(errorHandler(403, 'you are not allowed to get all users'));
    }
    try {
const startIndex = parseInt(req.query.startIndex) || 0;
const limit = parseInt(req.query.limit) || 9;
const sortDirection = req.query.sort ==='asc' ? 1 : -1;
 const allowedRoles = ["admin", "finance", "marketing", "production", "cashier", "dispatcher"];
const users = await User.find({ role: { $in: allowedRoles } })
.sort({createdAt: sortDirection})
.skip(startIndex)
.limit(limit);
const userWithoutPassword = users.map(user => {
    const {password, ...rest} = user._doc;
    return rest;
    }
);
const totalUsers = await User.countDocuments(); 
const now = new Date();
const oneMonthAgo = new Date(
    now.getFullYear(),
    now.getMonth() - 1,
    now.getDate()
    );
    const lastMonthUsers = await User.countDocuments({
        createdAt: {$gte: oneMonthAgo}
    });

    res.status(200).json({
        users: userWithoutPassword, totalUsers, lastMonthUsers});


    }
    catch (error) {
        next(error);
    }
};
const getUser = async (req, res, next) => {
    try {
        const user = await User.findById(req.params.userId);
        if (!user) {
            return next(errorHandler(404, 'User not found'));
        }
        const {password, ...rest} = user._doc;
        res.status(200).json(rest);
    }
    catch (error) {
        next(error);
    }
};






export {updateUser , deleteUser, signOut, getCustomers, getUser, getEmployees};

// Compare this snippet from client/src/pages/Projects/Projects.jsx:
