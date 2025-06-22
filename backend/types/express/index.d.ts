import { JwtPayload } from 'jsonwebtoken';

// to extend the Express Request interface to include a user property
declare global {
  namespace Express {
    interface Request {
      user?: string | JwtPayload;
    }
  }
}