import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpStatus,
} from '@nestjs/common';
import { MongoError } from 'mongodb';
import { Response } from 'express';
import { ErrorCodes } from '@shared/enums';
import { HttpAdapterHost } from '@nestjs/core';

@Catch(MongoError)
export class MongoExceptionFilter implements ExceptionFilter {
  constructor(private readonly httpAdapterHost: HttpAdapterHost) {}

  catch(exception: MongoError, host: ArgumentsHost) {
    const { httpAdapter } = this.httpAdapterHost;
    switch (exception.code) {
      case 11000:
        const ctx = host.switchToHttp();
        const response = ctx.getResponse<Response>();
        response.statusCode = HttpStatus.BAD_REQUEST;
        response.json({
          statusCode: HttpStatus.BAD_REQUEST,
          errorCode: ErrorCodes.MONGO_DB,
          message: 'Registro duplicado',
          path: httpAdapter.getRequestUrl(ctx.getRequest()) as string,
        });
    }
  }
}
