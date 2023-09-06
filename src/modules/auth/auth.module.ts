import { CONFIG } from '@config/index';
import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { JwtModule } from '@nestjs/jwt';
import { MongooseModule } from '@nestjs/mongoose';
import { PassportModule } from '@nestjs/passport';
import { RefreshToken, RefreshTokenSchema } from '@schemas';
import { FacebookAuthModule } from 'facebook-auth-nestjs';
import { EmployeeModule } from '../employee/employee.module';
import { EmployerModule } from '../employer/employer.module';
import { MailModule } from '../mail/mail.module';
import { UserModule } from '../user/user.module';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { GoogleAuthenticationService } from './google.service';
import { JwtStrategy, LocalStrategy } from './strategies';

@Module({
  imports: [
    UserModule,
    EmployeeModule,
    EmployerModule,
    MailModule,
    MongooseModule.forFeature([
      { name: RefreshToken.name, schema: RefreshTokenSchema },
    ]),
    PassportModule,
    JwtModule.registerAsync({
      imports: [ConfigModule],
      useFactory: (configService: ConfigService) => ({
        secret: configService.get<string>(CONFIG.TOKEN_SECRET),
        signOptions: {
          expiresIn: configService.get<string>(CONFIG.TOKEN_EXPIRES_IN),
        },
      }),
      inject: [ConfigService],
    }),
    FacebookAuthModule,
  ],
  providers: [
    GoogleAuthenticationService,
    AuthService,
    LocalStrategy,
    JwtStrategy,
  ],
  controllers: [AuthController],
  exports: [GoogleAuthenticationService],
})
export class AuthModule {}
