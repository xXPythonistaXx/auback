import { ExtractJwt, Strategy } from 'passport-jwt';
import { PassportStrategy } from '@nestjs/passport';
import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { CONFIG } from '@config/index';
import { ITokenParsePayload, ITokenPayload } from '@shared/interfaces';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy, 'jwt') {
  constructor(readonly configService: ConfigService) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: configService.get<string>(CONFIG.TOKEN_SECRET),
    });
  }

  validate({ sub, ...payload }: ITokenPayload): ITokenParsePayload {
    return {
      _id: sub,
      ...payload,
    };
  }
}
