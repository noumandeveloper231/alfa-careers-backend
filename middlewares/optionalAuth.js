import jwt from "jsonwebtoken";
import authModel from "../models/authModels.js";

// Middleware that attempts to authenticate the user via cookie token if present.
// If no token or token is invalid/expired, it simply proceeds without blocking the request.
const optionalAuth = async (req, res, next) => {
  try {
    const token = req.cookies?.token;
    if (!token) {
      return next(); // No auth cookie present – treat as anonymous user
    }

    let decoded;
    try {
      decoded = jwt.verify(token, process.env.JWT_SECRET);
    } catch (err) {
      // Invalid token – continue as anonymous
      return next();
    }

    // Attach the authenticated user document to the request if found
    const user = await authModel.findById(decoded.userId);
    if (user) {
      req.user = user;
    }
    // In case user not found, we still allow anonymous access
    return next();
  } catch (error) {
    // On any unexpected error just proceed without auth – we don't want to block the request
    return next();
  }
};

export default optionalAuth;
