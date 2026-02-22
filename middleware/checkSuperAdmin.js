import jwt from 'jsonwebtoken';
import dotenv from "dotenv";
import { SUPER_ADMIN_ROLE } from '../constants/roles.js';

dotenv.config();

const checkSuperAdmin = (req, res, next) => {
  const authHeader = req.headers.authorization;

  if (!authHeader) {
    return res.status(401).json({ message: "Authorization header is missing" });
  }

  if (!authHeader.startsWith("Bearer ")) {
    return res.status(401).json({ message: "Invalid authorization format" });
  }

  const token = authHeader.split(" ")[1];

  jwt.verify(token, process.env.JWT_SECRET, (err, decoded) => {
    if (err) {
      console.error("Token verification failed:", err);
      return res.status(401).json({ message: "Invalid token" });
    }

    req.user = decoded;

    if (!decoded.isAdmin || decoded.role !== SUPER_ADMIN_ROLE) {
      return res.status(403).json({ message: "Access denied. Super admins only." });
    }

    next();
  });
};

export default checkSuperAdmin;
