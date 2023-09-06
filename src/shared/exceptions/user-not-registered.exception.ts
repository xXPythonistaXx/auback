import { HttpException, HttpStatus } from '@nestjs/common';
import { ErrorCodes } from '@shared/enums';

export class UserNotRegisteredException extends HttpException {
  constructor(message?: string) {
    super(
      {
        statusCode: HttpStatus.BAD_REQUEST,
        errorCode: ErrorCodes.USER_NOT_REGISTERED,
        message: message || 'Usuário não registrado.',
      },
      HttpStatus.BAD_REQUEST,
    );
  }
}
