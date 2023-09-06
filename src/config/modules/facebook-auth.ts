/* eslint-disable @typescript-eslint/no-var-requires */
/* eslint-disable @typescript-eslint/no-unsafe-call */
/* eslint-disable @typescript-eslint/no-unsafe-return */
import { ConfigModule as FacebookConfigModule } from 'facebook-auth-nestjs';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { CONFIG } from '@config/index';

export const configFacebookAuth = {
  imports: [ConfigModule],
  useFactory: (configService: ConfigService) =>
    ({
      clientId: configService.get<string>(CONFIG.FACEBOOK_CLIENT_ID),
      clientSecret: configService.get<string>(CONFIG.FACEBOOK_CLIENT_SECRET),
    } as unknown as FacebookConfigModule),
  inject: [ConfigService],
};
