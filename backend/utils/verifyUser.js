import jwt from 'jsonwebtoken';
import User from '../model/user.js';
import { errorHandler } from './error.js';

const verifyUser = async (req, res, next) => {
  console.log('cookies:', req.cookies);
  const token = req.cookies.access_token;
  console.log('token of verifyUser', token);

  if (!token) {
    return next(errorHandler(401, 'Token not found', 'Unauthorized'));
  }

  try {
    // Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    console.log('Decoded token:', decoded);

    // Find user only in User model
    const user = await User.findById(decoded.id).select('-password');

    if (!user) {
      return next(errorHandler(404, 'User not found', 'User not found'));
    }

    req.user = {
      _id: user._id,
      firstname: user.firstname,
      lastname: user.lastname,
      phoneNumber: user.phoneNumber,
      isAdmin: user.isAdmin,
    };

    console.log('req.user after attachment:', req.user);
    next();
  } catch (err) {
    console.error('JWT verification error:', err);
    return next(errorHandler(401, 'Invalid token', 'Unauthorized'));
  }
};

export default verifyUser;