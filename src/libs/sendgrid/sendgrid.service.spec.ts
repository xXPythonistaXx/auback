const mockSetApiKeySpy = jest.fn();
const mockSendSpy = jest.fn();

import { Test, TestingModule } from '@nestjs/testing';
import { SendgridService } from './sendgrid.service';
import { EmailGatewayDto } from '../../shared/interfaces/sendgrid.interface';
import { ConfigModule } from '@nestjs/config';
import { TemplateId } from '../../shared/enums/email-templates.enum';

jest.mock('@sendgrid/mail', () => ({
  setApiKey: mockSetApiKeySpy,
  send: mockSendSpy,
}));

describe('SendgridService', () => {
  let sut: SendgridService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [ConfigModule],
      providers: [SendgridService],
    }).compile();

    sut = module.get<SendgridService>(SendgridService);
  });

  it('should be defined', () => {
    expect(sut).toBeDefined();
  });

  describe('SendgridService.send', () => {
    describe('when environment is development', () => {
      let result;

      beforeEach(async () => {
        mockSendSpy.mockResolvedValueOnce([
          {
            statusCode: 202,
          },
        ]);

        const message: EmailGatewayDto = {
          dynamicTemplateData: { any: 'value' },
          to: 'rafael@academiadouniversitario.com.br',
          from: 'au@mail.com',
          templateName: 'EMAIL_CONFIRMATION',
        };

        result = await sut.send(message);
      });

      it('should send an email', () => {
        expect(mockSendSpy).toHaveBeenCalled();
        expect(result).toBe(202);
      });
    });

    describe('when a request error occurs', () => {
      let error;

      beforeEach(async () => {
        mockSendSpy.mockRejectedValueOnce(
          Error('bananas-exploded-on-the-internet'),
        );

        const message: EmailGatewayDto = {
          dynamicTemplateData: { any: 'value' },
          to: 'rafael@academiadouniversitario.com.br',
          from: 'au@mail.com',
          templateName: 'EMAIL_CONFIRMATION',
        };

        try {
          await sut.send(message);
        } catch (err) {
          error = err;
        }
      });

      it('should throw the original error', () => {
        expect(error).toEqual(new Error('bananas-exploded-on-the-internet'));
      });
    });

    describe('when templateName has no corresponding templateId', () => {
      let error;

      beforeEach(async () => {
        const message = {
          dynamicTemplateData: { any: 'value' },
          to: 'rafael@academiadouniversitario.com.br',
          from: 'au@mail.com',
          templateName: 'it_was_all_a_lie_you_are_millionaire_congrats',
        } as any;

        try {
          await sut.send(message);
        } catch (err) {
          error = err;
        }
      });

      it('should throw a template error', () => {
        expect(error).toEqual(
          new Error(
            'Could not get template for: it_was_all_a_lie_you_are_millionaire_congrats',
          ),
        );
      });
    });

    describe('when templateName, subject and content are given', () => {
      let error;

      beforeEach(async () => {
        const message = {
          dynamicTemplateData: { any: 'value' },
          to: 'rafael@academiadouniversitario.com.br',
          from: 'au@mail.com',
          templateName: 'EMAIL_CONFIRMATION',
          subject: 'Look, if you had one shot',
          content: [
            {
              type: 'text/plain',
              value: 'Or one opportunity',
            },
          ],
        };

        try {
          await sut.send(message as any);
        } catch (err) {
          error = err;
        }
      });

      it('should throw a SGMessage error', () => {
        expect(error).toEqual(
          new Error('Email must have template or have a subject with content'),
        );
      });
    });

    describe('when only subject is given', () => {
      let error;

      beforeEach(async () => {
        const message = {
          dynamicTemplateData: { any: 'value' },
          to: 'rafael@academiadouniversitario.com.br',
          from: 'au@mail.com',
          content: [
            {
              type: 'text/plain',
              value: 'One moment. Would you capture it. Or just let it slip?',
            },
          ],
        };

        try {
          await sut.send(message);
        } catch (err) {
          error = err;
        }
      });

      it('should throw a SGMessage error', () => {
        expect(error).toEqual(
          new Error('Email must have template or have a subject with content'),
        );
      });
    });

    describe('when content is given', () => {
      let error;

      beforeEach(async () => {
        const message = {
          dynamicTemplateData: { any: 'value' },
          to: 'rafael@academiadouniversitario.com.br',
          from: 'au@mail.com',
          subject: 'To seize everything you ever wanted',
        };

        try {
          await sut.send(message);
        } catch (err) {
          error = err;
        }
      });

      it('should throw a SGMessage error', () => {
        expect(error).toEqual(
          new Error('Email must have template or have a subject with content'),
        );
      });
    });

    describe('when all attributes are present for an email with template', () => {
      let result;

      beforeEach(async () => {
        mockSendSpy.mockResolvedValueOnce([
          {
            statusCode: 202,
          },
        ]);

        const message: EmailGatewayDto = {
          dynamicTemplateData: { any: 'value' },
          to: 'rafael@academiadouniversitario.com.br',
          from: 'au@mail.com',
          templateName: 'EMAIL_CONFIRMATION',
        };

        result = await sut.send(message);
      });

      it('should use the sendgrid sdk correctly to send an email', () => {
        expect(mockSendSpy).toHaveBeenCalledWith({
          dynamicTemplateData: { any: 'value' },
          to: 'rafael@academiadouniversitario.com.br',
          from: 'au@mail.com',
          templateId: TemplateId.EMAIL_CONFIRMATION,
        });
      });

      it('should return the status code', () => {
        expect(result).toEqual(202);
      });
    });

    describe('when all attributes are present for an email without template', () => {
      beforeEach(async () => {
        mockSendSpy.mockResolvedValueOnce([
          {
            statusCode: 202,
          },
        ]);

        const message = {
          to: 'rafael@academiadouniversitario.com.br',
          from: 'au@mail.com',
          subject: 'Hello it is me',
          content: [
            {
              type: 'text/plain',
              value: 'I have thought about us for a long long time',
            },
          ],
        };

        await sut.send(message);
      });

      it('should use the sendgrid sdk correctly to send an email', () => {
        expect(mockSendSpy).toHaveBeenCalledWith({
          dynamicTemplateData: undefined,
          to: 'rafael@academiadouniversitario.com.br',
          from: 'au@mail.com',
          subject: 'Hello it is me',
          content: [
            {
              type: 'text/plain',
              value: 'I have thought about us for a long long time',
            },
          ],
        });
      });
    });
  });
});
