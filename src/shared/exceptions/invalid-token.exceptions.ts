import { HttpException, HttpStatus } from '@nestjs/common';
import { ErrorCodes } from '@shared/enums';

export class InvalidTokenException extends HttpException {
  constructor(message?: string) {
    super(
      {
        statusCode: HttpStatus.FORBIDDEN,
        errorCode: ErrorCodes.INVALID_TOKEN,
        message: message || 'Token inválido.',
      },
      HttpStatus.FORBIDDEN,
    );
  }
}
