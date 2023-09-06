import { SetMetadata } from '@nestjs/common';

export const JwtAuth = () => SetMetadata('jwt-auth', true);
