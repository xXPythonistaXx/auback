import { CONFIG } from '@config/index';
import { MailerModule } from '@nestjs-modules/mailer';
import { HandlebarsAdapter } from '@nestjs-modules/mailer/dist/adapters/handlebars.adapter';
import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { MailService } from './mail.service';
import { LoggerModule } from '../logger/logger.module';
import { SendgridService } from '../../libs/sendgrid/sendgrid.service';

@Module({
  imports: [
    LoggerModule,
    MailerModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: (configService: ConfigService) => ({
        transport: {
          host: configService.get(CONFIG.SMTP_HOST),
          secure: false,
          port: configService.get(CONFIG.SMTP_PORT),
          auth: {
            user: configService.get(CONFIG.SMTP_USER),
            pass: configService.get(CONFIG.SMTP_SECRET),
          },
        },
        defaults: {
          from: '"No Reply" <noreply@au.com.br>',
        },
        template: {
          dir:
            configService.get(CONFIG.NODE_ENV) !== 'development'
              ? 'dist/modules/mail/templates'
              : 'src/modules/mail/templates',

          adapter: new HandlebarsAdapter(),
          options: {
            strict: true,
          },
        },
      }),
      inject: [ConfigService],
    }),
  ],
  providers: [MailService, SendgridService],
  exports: [MailService],
})
export class MailModule {}
