import { HttpException, HttpStatus } from '@nestjs/common';
import { ErrorCodes } from '@shared/enums';

export class NotFoundException extends HttpException {
  constructor(message?: string) {
    super(
      {
        statusCode: HttpStatus.NOT_FOUND,
        errorCode: ErrorCodes.NOT_FOUND,
        message: message || 'Registro não encontrado.',
      },
      HttpStatus.NOT_FOUND,
    );
  }
}
