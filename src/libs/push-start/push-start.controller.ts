import {
  Controller,
  Post,
  Body,
  HttpCode,
  HttpStatus,
  NotFoundException,
} from '@nestjs/common';
import { PushStartService } from './push-start.service';
import { Public } from '@shared/decorators';

@Controller('external/pushstart')
export class PushStartController {
  constructor(private readonly pushStartService: PushStartService) {}

  @Post('result')
  @HttpCode(HttpStatus.OK)
  @Public()
  async handleWebhook(@Body() data: any) {
    try {
      await this.pushStartService.handlePushStartWebhook(data);

      return { message: 'Webhook received and processed successfully' };
    } catch (error) {
      if (error instanceof NotFoundException) {
        return {
          message: 'JobStepCandidate not found',
          status: HttpStatus.NOT_FOUND,
        };
      }
      return {
        message: 'An error occurred while processing the webhook',
        status: HttpStatus.INTERNAL_SERVER_ERROR,
      };
    }
  }
}
