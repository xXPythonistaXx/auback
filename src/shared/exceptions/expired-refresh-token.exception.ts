import { HttpException, HttpStatus } from '@nestjs/common';
import { ErrorCodes } from '@shared/enums';

export class ExpiredRefreshTokenException extends HttpException {
  constructor(message?: string) {
    super(
      {
        statusCode: HttpStatus.UNAUTHORIZED,
        errorCode: ErrorCodes.EXPIRED_REFRESH_TOKEN,
        message: message || 'Refresh Token expirado',
      },
      HttpStatus.UNAUTHORIZED,
    );
  }
}
