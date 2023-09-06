import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  BadRequestException,
} from '@nestjs/common';
import { ErrorCodes } from '@shared/enums';
import { Response } from 'express';
import { PinoService } from '../../modules/logger/pino.service';

@Catch(BadRequestException)
export class BadRequestExceptionFilter implements ExceptionFilter {
  logger: PinoService = new PinoService();

  catch(exception: BadRequestException, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const status = exception.getStatus();

    this.logger.error(exception.getResponse().toString());

    response.status(status).json({
      statusCode: status,
      errorCode:
        (exception.getResponse() as { errorCode?: string })?.errorCode ||
        ErrorCodes.BAD_REQUEST,
      message: exception.message,
    });
  }
}
