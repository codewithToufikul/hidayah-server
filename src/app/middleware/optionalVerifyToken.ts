// middleware/optionalVerifyToken.ts
import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';

dotenv.config();

export const optionalVerifyToken = (req: Request, res: Response, next: NextFunction) => {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return next();
  }

  const token = authHeader.split(" ")[1];
  jwt.verify(token, process.env.JWT_SECRET as string, (err, decoded: any) => {
    if (!err && decoded) {
      (req as any).userId = decoded.id;
    }
    // even if token is invalid, don't block the request
    return next();
  });
};
