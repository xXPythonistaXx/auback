import { Injectable, NestMiddleware } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';
import { PinoService } from './pino.service';
import cuid from 'cuid';

type UserRecord = {
  uid?: string;
  email?: string;
};

@Injectable()
export class LoggerMiddleware implements NestMiddleware {
  constructor(private logger: PinoService) {}

  use(req: Request, res: Response, next: NextFunction) {
    const { method, url, body } = req;
    const { uid, email }: UserRecord = req.user;

    const { statusCode } = res;

    const message = `[API] ${method} ${url} ${statusCode}`;

    const request = {
      method,
      url,
      body,
    };

    const response = {
      statusCode,
    };

    this.logger.log(message, {
      id: cuid(),
      user: { uid, email },
      request,
      response,
    });

    next();
  }
}
