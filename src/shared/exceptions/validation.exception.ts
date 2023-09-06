import { HttpException, HttpStatus } from '@nestjs/common';
import { ErrorCodes } from '@shared/enums';

export class ValidationException extends HttpException {
  constructor(field: string, message?: string) {
    super(
      {
        statusCode: HttpStatus.BAD_REQUEST,
        errorCode: ErrorCodes.VALIDATION,
        message: { [field]: message || 'Campo incorreto.' },
      },
      HttpStatus.BAD_REQUEST,
    );
  }
}
