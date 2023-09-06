import { Controller, Get, Query } from '@nestjs/common';
import { RdStationService } from './rd-station.service';
import { Public } from '@shared/decorators';

@Controller()
export class RdStationController {
  constructor(private readonly rdStationService: RdStationService) {}

  @Public()
  @Get('/rd-station/get-first-access-token')
  getFirstAccessToken(@Query() { code }: { code: string }) {
    return this.rdStationService.getFirstAccessToken(code);
  }
}
