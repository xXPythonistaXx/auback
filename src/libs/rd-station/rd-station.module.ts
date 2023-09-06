import { Module } from '@nestjs/common';
import { RdStationService } from './rd-station.service';
import { RdStationController } from './rd-station.controller';
import { LoggerModule } from '@modules/logger/logger.module';

@Module({
  imports: [LoggerModule],
  controllers: [RdStationController],
  providers: [RdStationService],
  exports: [RdStationService],
})
export class RdStationModule {}
