import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpException,
  HttpStatus,
} from '@nestjs/common';
import { HttpAdapterHost } from '@nestjs/core';
import { ErrorCodes } from '@shared/enums';
import { PinoService } from '../../modules/logger/pino.service';

@Catch()
export class AllExceptionsFilter implements ExceptionFilter {
  logger: PinoService = new PinoService();

  constructor(private readonly httpAdapterHost: HttpAdapterHost) {}

  catch(exception: unknown, host: ArgumentsHost): void {
    this.logger.error(exception as string);

    const { httpAdapter } = this.httpAdapterHost;

    const ctx = host.switchToHttp();

    const httpStatus =
      exception instanceof HttpException
        ? exception.getStatus()
        : HttpStatus.INTERNAL_SERVER_ERROR;

    const errorCode =
      exception instanceof HttpException
        ? (exception.getResponse() as { errorCode: string }).errorCode
        : ErrorCodes.INTERNAL_SERVER_ERROR;

    const message =
      exception instanceof HttpException
        ? (exception.getResponse() as { message: string }).message
        : 'Erro interno de servidor. Tente novamente mais tarde.';

    // if (!(exception instanceof HttpException)) console.log(exception);

    const responseBody = {
      statusCode: httpStatus,
      errorCode: errorCode || ErrorCodes.GENERIC,
      message,
      path: httpAdapter.getRequestUrl(ctx.getRequest()) as string,
    };

    httpAdapter.reply(ctx.getResponse(), responseBody, httpStatus);
  }
}
