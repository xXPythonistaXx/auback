import { Injectable, NestMiddleware } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';

@Injectable()
export class ExternalAuthMiddleware implements NestMiddleware {
  private readonly validToken = process.env.PUSH_START_TOKEN;

  use(req: Request, res: Response, next: NextFunction) {
    const authToken = req.header('Authorization');

    if (authToken === `Bearer ${this.validToken}`) {
      next();
    } else {
      res.status(401).json({ message: 'Unauthorized' });
    }
  }
}
