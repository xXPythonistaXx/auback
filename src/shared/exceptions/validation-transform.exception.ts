import { HttpException, HttpStatus, ValidationError } from '@nestjs/common';
import { ErrorCodes } from '@shared/enums';

export function validationExceptionTransform(errors: ValidationError[]) {
  return new HttpException(
    {
      statusCode: HttpStatus.BAD_REQUEST,
      errorCode: ErrorCodes.VALIDATION,
      message: errors.reduce((prev, next) => {
        return {
          ...prev,
          [next.property]: Object.values(next.constraints),
        };
      }, {}),
    },
    HttpStatus.BAD_REQUEST,
  );
}
