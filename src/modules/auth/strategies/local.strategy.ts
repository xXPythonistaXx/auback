import { BadRequestException, Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ErrorCodes } from '@shared/enums';
import { isEmail } from 'class-validator';
import { Strategy } from 'passport-local';
import { AuthService } from '../auth.service';

@Injectable()
export class LocalStrategy extends PassportStrategy(Strategy) {
  constructor(private authService: AuthService) {
    super({ usernameField: 'email' });
  }

  async validate(email: string, password: string): Promise<any> {
    if (!isEmail(email)) throw new BadRequestException('Email inválido.');
    const user = await this.authService.validateUser(email, password);
    if (!user) {
      throw new BadRequestException({
        errorCode: ErrorCodes.EMAIL_OR_PASSWORD_INVALID,
      });
    }
    return user;
  }
}
