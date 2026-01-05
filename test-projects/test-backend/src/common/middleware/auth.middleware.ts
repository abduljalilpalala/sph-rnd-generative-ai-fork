import { Injectable, NestMiddleware } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';

@Injectable()
export class AuthMiddleware implements NestMiddleware {
  use(req: Request, res: Response, next: NextFunction) {
    // For demo purposes, we'll use a simple header-based auth
    // In a real application, this would verify JWT tokens or sessions
    const userId = req.headers['x-user-id'];
    const userEmail = req.headers['x-user-email'];
    const userRole = req.headers['x-user-role'] || 'USER';

    if (userId && userEmail) {
      req['user'] = {
        id: parseInt(userId as string, 10),
        email: userEmail,
        role: userRole,
      };
    }

    next();
  }
}
