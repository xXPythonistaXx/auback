import { Module } from '@nestjs/common';
import { EventsService } from './events.service';
import { EventsController } from './events.controller';
import { EventEmitterModule } from '@nestjs/event-emitter';
import { eventEmitterConfig } from '@config/index';
import { LoggerModule } from '@modules/logger/logger.module';
import { RdStationModule } from '@libs/rd-station/rd-station.module';
import { LearnWorldsModule } from '../../libs/learn-worlds/learn-worlds.module';
import { PushStartModule } from '@libs/push-start/push-start.module';

@Module({
  imports: [
    EventEmitterModule.forRoot(eventEmitterConfig),
    LoggerModule,
    RdStationModule,
    LearnWorldsModule,
    PushStartModule,
  ],
  controllers: [EventsController],
  providers: [EventsService],
  exports: [EventsService],
})
export class EventsModule {}
