import { EmailTemplates } from '@shared/enums/email-templates.enum';

interface BaseMessage {
  to: string;
  from: string;
  dynamicTemplateData?: DynamicTemplateData;
}

export interface DynamicTemplateData {
  [key: string]: any;
}

export type EmailGatewayDto = {
  from: string;
  to: string;
  templateName?: EmailTemplates;
  lang?: string;
  subject?: string;
  content?: MailContent;
  dynamicTemplateData?: DynamicTemplateData;
};

export type MailContent = {
  type: string;
  value: string;
}[];

export type BuildSgMessageReturn = BaseMessage &
  (
    | {
        content: MailContent;
        subject: string;
      }
    | {
        templateId: string;
      }
  );
