import { Test, TestingModule } from '@nestjs/testing';
import { MailService } from './mail.service';
import { SendgridService } from '../../libs/sendgrid/sendgrid.service';
import { SetupTestModule } from '../../../test/helpers/setup-test';
import { CONFIG } from '../../config';
import { SendCandidateMessageParams } from '../../shared/interfaces/mail.interface';

const SendgridServiceMock = {
  send: jest.fn(),
};

describe('MailService', () => {
  let sut: MailService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [...SetupTestModule],
      providers: [
        MailService,
        {
          provide: SendgridService,
          useValue: SendgridServiceMock,
        },
      ],
    }).compile();

    sut = module.get<MailService>(MailService);
  });

  it('should be defined', () => {
    expect(sut).toBeDefined();
  });

  describe('sendCandidateApproveMessage', () => {
    describe('when send a custom email template', () => {
      it('should be call correct with STEP_APPROVED_CUSTOM_MESSAGE template name', async () => {
        const params: SendCandidateMessageParams = {
          firstName: 'any_name',
          email: 'any@mail.com',
          custom: true,
        };

        await sut.sendCandidateApproveMessage(params);

        expect(SendgridServiceMock.send).toBeCalledWith({
          templateName: 'STEP_APPROVED_CUSTOM_MESSAGE',
          from: process.env[CONFIG.SMTP_FROM_EMAIL],
          to: params.email,
          dynamicTemplateData: {
            firstName: params.firstName,
          },
        });
      });
    });

    describe('when send not a custom email template', () => {
      it('should be call correct with STEP_APPROVED_MESSAGE template name', async () => {
        const params: SendCandidateMessageParams = {
          firstName: 'any_name',
          email: 'any@mail.com',
          custom: false,
        };

        await sut.sendCandidateApproveMessage(params);

        expect(SendgridServiceMock.send).toBeCalledWith({
          templateName: 'STEP_APPROVED_MESSAGE',
          from: process.env[CONFIG.SMTP_FROM_EMAIL],
          to: params.email,
          dynamicTemplateData: {
            firstName: params.firstName,
          },
        });
      });
    });
  });

  describe('sendCandidateReprovedMessage', () => {
    describe('when send a custom email template', () => {
      it('should be call correct with STEP_REPROVE_CUSTOM_MESSAGE template name', async () => {
        const params = {
          firstName: 'any_name',
          email: 'any@mail.com',
          custom: true,
        };

        await sut.sendCandidateReprovedMessage(params);

        expect(SendgridServiceMock.send).toBeCalledWith({
          templateName: 'STEP_REPROVE_CUSTOM_MESSAGE',
          from: process.env[CONFIG.SMTP_FROM_EMAIL],
          to: params.email,
          dynamicTemplateData: {
            firstName: params.firstName,
          },
        });
      });
    });

    describe('when send not a custom email template', () => {
      it('should be call correct with STEP_REPROVE_MESSAGE template name', async () => {
        const params = {
          firstName: 'any_name',
          email: 'any@mail.com',
          custom: false,
        };

        await sut.sendCandidateReprovedMessage(params);

        expect(SendgridServiceMock.send).toBeCalledWith({
          templateName: 'STEP_REPROVE_MESSAGE',
          from: process.env[CONFIG.SMTP_FROM_EMAIL],
          to: params.email,
          dynamicTemplateData: {
            firstName: params.firstName,
          },
        });
      });
    });
  });
});
