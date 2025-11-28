import jwt from 'jsonwebtoken'
import { errorHandler } from './error.js'

export default async (req, res, next) => {
  const token = req.cookies.access_token || req.header('Authorization')?.replace('Bearer ', '')

  if (!token) {
    return next(errorHandler(401, 'Unauthorized'))
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET)
    req.user = decoded
    next()
  } catch (error) {
    next(errorHandler(403, 'Invalid token'))
  }
}