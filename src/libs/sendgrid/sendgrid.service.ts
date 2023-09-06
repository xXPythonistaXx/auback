import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as SendGrid from '@sendgrid/mail';
import { EmailTemplates, TemplateId } from '@shared/enums/email-templates.enum';
import {
  BuildSgMessageReturn,
  EmailGatewayDto,
} from '@shared/interfaces/sendgrid.interface';

@Injectable()
export class SendgridService {
  constructor(private readonly configService: ConfigService) {
    SendGrid.setApiKey(this.configService.get<string>('SEND_GRID_KEY'));
  }

  async send(message: EmailGatewayDto): Promise<number | void> | never {
    const { templateName } = message;

    const templateId = this.getTemplateId(templateName);

    const sgMessage = this.buildMessage(message, templateId);

    const [clientResponse] = await SendGrid.send(
      sgMessage as SendGrid.MailDataRequired,
    );
    const { statusCode } = clientResponse;

    return statusCode;
  }

  protected getTemplateId(templateName: EmailTemplates): string | null | never {
    if (!templateName) {
      return null;
    }

    const templateId = TemplateId[templateName];

    if (templateId) {
      return templateId;
    }

    throw new Error(`Could not get template for: ${templateName.toString()}`);
  }

  protected buildMessage(
    message: EmailGatewayDto,
    templateId: string | null,
  ): BuildSgMessageReturn {
    const { subject, to, from, dynamicTemplateData, content } = message;
    const baseMessage = { to, from, dynamicTemplateData };

    if (!templateId && subject && content) {
      return {
        ...baseMessage,
        content,
        subject,
      };
    }

    if (templateId && !subject && !content) {
      return {
        ...baseMessage,
        templateId,
      };
    }

    throw new Error('Email must have template or have a subject with content');
  }
}
