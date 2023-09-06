import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  ForbiddenException,
} from '@nestjs/common';
import { HttpAdapterHost } from '@nestjs/core';
import { ErrorCodes } from '@shared/enums';
import { Response } from 'express';
import { PinoService } from '../../modules/logger/pino.service';

@Catch(ForbiddenException)
export class ForbiddenExceptionFilter implements ExceptionFilter {
  logger: PinoService = new PinoService();

  constructor(private readonly httpAdapterHost: HttpAdapterHost) {}

  catch(exception: ForbiddenException, host: ArgumentsHost) {
    const { httpAdapter } = this.httpAdapterHost;
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const status = exception.getStatus();

    this.logger.error(exception.getResponse().toString());

    response.status(status).json({
      statusCode: status,
      errorCode:
        (exception.getResponse() as { errorCode?: string })?.errorCode ||
        ErrorCodes.FORBIDDEN,
      message: 'Você não possui acesso ao recurso solicitado.',
      path: httpAdapter.getRequestUrl(ctx.getRequest()) as string,
    });
  }
}
