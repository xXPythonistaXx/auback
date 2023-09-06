import { Controller, Get, Request, Post, Body } from '@nestjs/common';
import { LearnWorldsService } from './learn-worlds.service';
import { ITokenParsePayload } from '@shared/interfaces';
import { Public } from '../../shared/decorators';
import { WebhookDTO } from './dto/webhook.dto';

@Controller('learn-worlds')
export class LearnWorldsController {
  constructor(private readonly learnWorldsService: LearnWorldsService) {}

  @Get('sso')
  async sso(@Request() req: { user: ITokenParsePayload }) {
    return this.learnWorldsService.sso(req.user._id);
  }

  @Public()
  @Post('webhook')
  async webhook(@Body() payload: WebhookDTO) {
    const { type } = payload;

    await this.learnWorldsService[type](payload);

    return true;
  }
}
