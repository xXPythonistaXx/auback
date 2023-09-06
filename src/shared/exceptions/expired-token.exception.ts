import { HttpException, HttpStatus } from '@nestjs/common';
import { ErrorCodes } from '@shared/enums';

export class ExpiredTokenException extends HttpException {
  constructor(message?: string) {
    super(
      {
        statusCode: HttpStatus.UNAUTHORIZED,
        errorCode: ErrorCodes.EXPIRED_TOKEN,
        message: message || 'Token expirado',
      },
      HttpStatus.UNAUTHORIZED,
    );
  }
}
