import { CONFIG } from '@config/index';
import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { DefaultRoles } from '@shared/enums';
import { PinoService } from '../logger/pino.service';
import { SendgridService } from '@libs/sendgrid/sendgrid.service';

import { EmailTemplates } from '../../shared/enums/email-templates.enum';
import { SendCandidateMessageParams } from '../../shared/interfaces/mail.interface';

@Injectable()
export class MailService {
  protected from: string;

  protected frontUrl: string;

  constructor(
    private configService: ConfigService,
    private readonly logger: PinoService,
    private sendgridService: SendgridService,
  ) {
    this.from = this.configService.get<string>(CONFIG.SMTP_FROM_EMAIL);
    this.frontUrl = this.configService.get<string>(CONFIG.FRONTEND_URL);
  }

  async sendPasswordResetCode(
    email: string,
    name: string,
    userId: string,
    token: string,
    role: string,
  ) {
    const userRole = role === DefaultRoles.employee ? 'employee' : 'employer';
    const resetPasswordUrl = `${this.frontUrl}/auth/${userRole}/reset-password?token=${token}&userId=${userId}`;

    await this.sendgridService.send({
      templateName: 'RESET_PASSWORD',
      from: this.from,
      to: email,
      dynamicTemplateData: {
        resetPasswordUrl,
      },
    });

    this.logger.log(`sent email reset password: ${email}`);
  }

  async sendEmailConfirmation(
    email: string,
    name: string,
    userId: string,
    token: string,
  ) {
    try {
      const activeAccountUrl = `${this.frontUrl}/auth?token=${token}&userId=${userId}`;

      await this.sendgridService.send({
        templateName: 'EMAIL_CONFIRMATION',
        from: this.from,
        to: email,
        dynamicTemplateData: {
          name,
          activeAccountUrl,
        },
      });

      this.logger.log(`sent email confirmation account: ${email}`);
    } catch (error) {
      this.logger.error(`Error on send email confirmation: ${email}`, error);
    }
  }

  async sendCandidateApproveMessage({
    email,
    custom = false,
    ...rest
  }: SendCandidateMessageParams) {
    try {
      const templateName: EmailTemplates = custom
        ? 'STEP_APPROVED_CUSTOM_MESSAGE'
        : 'STEP_APPROVED_MESSAGE';

      await this.sendgridService.send({
        templateName,
        from: this.from,
        to: email,
        dynamicTemplateData: rest,
      });

      this.logger.log(`sent email candidate approve: ${email}`);
    } catch (error) {
      this.logger.error(`Error on send email: ${email}`, error);
    }
  }

  async sendCandidateReprovedMessage({
    email,
    custom = false,
    ...rest
  }: SendCandidateMessageParams) {
    try {
      const templateName: EmailTemplates = custom
        ? 'STEP_REPROVE_CUSTOM_MESSAGE'
        : 'STEP_REPROVE_MESSAGE';

      await this.sendgridService.send({
        templateName,
        from: this.from,
        to: email,
        dynamicTemplateData: rest,
      });

      this.logger.log(`sent email candidate reprove: ${email}`);
    } catch (error) {
      this.logger.error(`Error on send email: ${email}`, error);
    }
  }

  async sendJobInvite({
    email,
    jobTitle,
    jobId,
    candidateName,
  }: {
    email: string;
    jobTitle: string;
    jobId: string;
    candidateName: string;
  }) {
    try {
      const jobUrl = `${this.frontUrl}/employee/new-jobs/${jobId}/job-profile`;

      await this.sendgridService.send({
        templateName: 'SELECTIVE_INVITE',
        from: this.from,
        to: email,
        dynamicTemplateData: {
          jobTitle,
          jobUrl,
          candidateName,
        },
      });

      this.logger.log(`sent email job invited: ${email}`);
    } catch (error) {
      this.logger.error(`Error on send job invited: ${email}`, error);
    }
  }
}
