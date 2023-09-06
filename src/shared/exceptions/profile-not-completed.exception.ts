import { HttpException, HttpStatus } from '@nestjs/common';
import { ErrorCodes } from '@shared/enums';

export class ProfileNotCompleted extends HttpException {
  constructor() {
    super(
      {
        statusCode: HttpStatus.BAD_REQUEST,
        errorCode: ErrorCodes.PROFILE_NOT_COMPLETED,
        message: `Candidato nao possui perfil completo.`,
      },
      HttpStatus.BAD_REQUEST,
    );
  }
}
