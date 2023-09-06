import {
  CacheModule,
  MiddlewareConsumer,
  Module,
  NestModule,
  RequestMethod,
} from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { APP_GUARD } from '@nestjs/core';
import { MongooseModule } from '@nestjs/mongoose';
import { FacebookAuthModule } from 'facebook-auth-nestjs';

import { AuthorizationModule } from './authorization/authorization.module';
import { TalentDatabaseModule } from './talent-database/talent-database.module';
import { UniversityModule } from './university/university.module';
import { AuthModule } from './auth/auth.module';
import { UserModule } from './user/user.module';
import { ToolModule } from './tool/tool.module';
import { StateModule } from './state/state.module';
import { MailModule } from './mail/mail.module';
import { SegmentModule } from './segment/segment.module';
import { AwsS3Module } from './aws-s3/aws-s3.module';
import { BenefitModule } from './benefit/benefit.module';
import { EmployeeModule } from './employee/employee.module';
import { EmployerModule } from './employer/employer.module';
import { JobModule } from './job/job.module';
import { LanguageModule } from './language/language.module';
import type { ClientOpts } from 'redis';
import * as redisStore from 'cache-manager-redis-store';

import {
  CONFIG,
  configFacebookAuth,
  configModule,
  mongooseConfig,
} from '@config/index';

import { JwtAuthGuard } from '@shared/guards';
import { RdStationModule } from '../libs/rd-station/rd-station.module';
import { LoggerModule } from './logger/logger.module';
import { LearnWorldsModule } from '@libs/learn-worlds/learn-worlds.module';
import { HealthModule } from './health/health.module';
import { CourseModule } from './course/course.module';
import { PushStartModule } from '@libs/push-start/push-start.module';
import { ExternalAuthMiddleware } from '@config/modules/jwt.middleware';
import { PushStartController } from '@libs/push-start/push-start.controller';
import { MacroJobModule } from './macro-job/macro-job.module';
@Module({
  imports: [
    ConfigModule.forRoot(configModule),
    MongooseModule.forRootAsync(mongooseConfig),
    CacheModule.register<ClientOpts>({
      ttl: 60 * 60 * 24 * 7,
      max: 100,
      isGlobal: true,
      host: process.env[CONFIG.REDIS_HOST],
      port: Number(process.env[CONFIG.REDIS_PORT]),
      password: process.env[CONFIG.REDIS_PASSWORD],
      store: redisStore,
    }),
    AuthModule,
    UserModule,
    EmployerModule,
    EmployeeModule,
    MailModule,
    FacebookAuthModule.forRootAsync(configFacebookAuth),
    AuthorizationModule,
    StateModule,
    UniversityModule,
    CourseModule,
    ToolModule,
    LanguageModule,
    TalentDatabaseModule,
    BenefitModule,
    SegmentModule,
    AwsS3Module,
    JobModule,
    RdStationModule,
    LoggerModule,
    LearnWorldsModule,
    HealthModule,
    PushStartModule,
    MacroJobModule,
  ],
  providers: [
    {
      provide: APP_GUARD,
      useClass: JwtAuthGuard,
    },
  ],
})
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(ExternalAuthMiddleware).forRoutes(PushStartController);
    consumer.apply(ExternalAuthMiddleware).forRoutes({
      path: 'employee/getEmployeeStatistics',
      method: RequestMethod.GET,
    });
  }
}
