// controllers/auth.controller.js
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { errorHandler } from "../utils/error.js";
import User from "../model/user.js";


export const signup = async (req, res, next) => {
  const { firstname, lastname, phoneNumber, password } = req.body;

  // Validate required fields
  if (!firstname || !lastname || !phoneNumber || !password) {
    return next(errorHandler(400, "All fields are required"));
  }

  try {
    // Check if phone already exists
    const existingUser = await User.findOne({ phoneNumber });
    if (existingUser) {
      return next(errorHandler(400, "Phone number already registered"));
    }

    // Hash password
    const hashedPassword = bcrypt.hashSync(password, 10);

    // Create new user
    const newUser = new User({
      firstname,
      lastname,
      phoneNumber,
      password: hashedPassword,
      // profilePicture will use default from schema
      // isAdmin: false by default
    });

    await newUser.save();

    res.status(201).json({
      success: true,
      message: "Account created successfully!",
    });
  } catch (error) {
    next(error);
  }
};

export const signin = async (req, res, next) => {
  const { phoneNumber, password } = req.body;

  if (!phoneNumber || !password) {
    return next(errorHandler(400, "Phone number and password are required"));
  }

  try {
    // Find user by phone
    const user = await User.findOne({ phoneNumber });
    if (!user) {
      return next(errorHandler(404, "Invalid phone number or password"));
    }

    // Check password
    const isValidPassword = bcrypt.compareSync(password, user.password);
    if (!isValidPassword) {
      return next(errorHandler(401, "Invalid phone number or password"));
    }

    // Create JWT token
    const token = jwt.sign(
      { 
        id: user._id, 
        isAdmin: user.isAdmin 
      },
      process.env.JWT_SECRET,
      { expiresIn: "7d" }
    );

    // Remove password from response
    const { password: pass, ...userInfo } = user._doc;

    // Send token in httpOnly cookie + user info
    res
      .cookie("access_token", token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
      })
      .status(200)
      .json({
        success: true,
        message: "Login successful",
        user: userInfo,
      });
  } catch (error) {
    next(error);
  }
};