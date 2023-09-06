import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  UnauthorizedException,
} from '@nestjs/common';
import { HttpAdapterHost } from '@nestjs/core';
import { ErrorCodes } from '@shared/enums';
import { Response } from 'express';
import { PinoService } from '../../modules/logger/pino.service';

@Catch(UnauthorizedException)
export class UnauthorizedExceptionFilter implements ExceptionFilter {
  logger: PinoService = new PinoService();

  constructor(private readonly httpAdapterHost: HttpAdapterHost) {}

  catch(exception: UnauthorizedException, host: ArgumentsHost) {
    const { httpAdapter } = this.httpAdapterHost;
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const status = exception.getStatus();

    this.logger.error(exception.getResponse().toString());

    response.status(status).json({
      statusCode: status,
      errorCode:
        (exception.getResponse() as { errorCode?: string })?.errorCode ||
        ErrorCodes.UNAUTHORIZED,
      message:
        (exception.getResponse() as { message?: string })?.message ||
        'Usuário não autorizado',
      path: httpAdapter.getRequestUrl(ctx.getRequest()) as string,
    });
  }
}
