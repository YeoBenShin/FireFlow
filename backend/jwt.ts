import { Request, Response, NextFunction } from 'express';
import dotenv from 'dotenv';
import path from 'path';
import jwt from 'jsonwebtoken';

dotenv.config({ path: path.resolve(__dirname, '../.env.local') });

export const verifyJWT = (req: Request, res: Response, next: NextFunction) => {
  const token = req.cookies.token;

  if (!token) {
    res.status(401).json({ error: 'No token provided' });
    return;
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET) as jwt.JwtPayload;
    
    // refresh the token
    const refreshedToken = jwt.sign(
      { sub: decoded.sub },
      process.env.JWT_SECRET,
      { expiresIn: "1h" }
    );

    res.cookie("token", refreshedToken, {
      httpOnly: true,
      secure: false,
      sameSite: "lax",
    maxAge: 60 * 60 * 1000, // 1 hour
    });

    req.user = decoded; // e.g. { sub: auth_user_id, ... }
    next();

  } catch (err) {
    res.status(403).json({ error: 'Invalid token' });
  }
};