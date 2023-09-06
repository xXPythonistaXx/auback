import { Test, TestingModule } from '@nestjs/testing';
import { PushStartController } from './push-start.controller';
import { PushStartService } from './push-start.service';
import { NotFoundException } from '@nestjs/common';

describe('PushStartController', () => {
  let controller: PushStartController;
  let pushStartService: PushStartService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [PushStartController],
      providers: [
        {
          provide: PushStartService,
          useValue: {
            handlePushStartWebhook: jest.fn(),
          },
        },
      ],
    }).compile();

    controller = module.get<PushStartController>(PushStartController);
    pushStartService = module.get<PushStartService>(PushStartService);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('handleWebhook', () => {
    it('should process webhook data successfully', async () => {
      const data = {};
      jest
        .spyOn(pushStartService, 'handlePushStartWebhook')
        .mockResolvedValue(undefined);

      const result = await controller.handleWebhook(data);

      expect(result).toEqual({
        message: 'Webhook received and processed successfully',
      });
    });

    it('should handle NotFoundException', async () => {
      const data = {};
      jest
        .spyOn(pushStartService, 'handlePushStartWebhook')
        .mockRejectedValue(new NotFoundException());

      const result = await controller.handleWebhook(data);

      expect(result).toEqual({
        message: 'JobStepCandidate not found',
        status: 404,
      });
    });

    it('should handle other errors', async () => {
      const data = {};
      jest
        .spyOn(pushStartService, 'handlePushStartWebhook')
        .mockRejectedValue(new Error());

      const result = await controller.handleWebhook(data);

      expect(result).toEqual({
        message: 'An error occurred while processing the webhook',
        status: 500,
      });
    });
  });
});
