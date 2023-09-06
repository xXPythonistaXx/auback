import { HttpException, HttpStatus } from '@nestjs/common';
import { ErrorCodes } from '@shared/enums';

export class UserRegisteredFromThirdOauthException extends HttpException {
  constructor(message?: string) {
    super(
      {
        statusCode: HttpStatus.BAD_REQUEST,
        errorCode: ErrorCodes.USER_REGISTERED_FROM_THIRD_OAUTH,
        message: message || 'Usuário registrado pelo google ou facebook.',
      },
      HttpStatus.BAD_REQUEST,
    );
  }
}
