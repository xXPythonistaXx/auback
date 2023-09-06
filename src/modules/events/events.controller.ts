import { Controller } from '@nestjs/common';
import { OnEvent } from '@nestjs/event-emitter';
import { Events } from '@shared/enums';
import { PinoService } from '../logger/pino.service';
import { RdStationService } from '@libs/rd-station/rd-station.service';
import { rdStationPayloadPurifier } from '@shared/helpers';
import { ContactPayload } from '@shared/interfaces';
import { LearnWorldsService } from '../../libs/learn-worlds/learn-worlds.service';

@Controller()
export class EventsController {
  constructor(
    private readonly logger: PinoService,
    private readonly rdStationService: RdStationService,
    private readonly learnWorldsService: LearnWorldsService,
  ) {}

  @OnEvent(Events.CLIENT_CREATED, { async: true })
  handleClientCreatedEvent(payload: any) {
    this.logger.log(`handle client started event: ${Events.CLIENT_CREATED}`);

    return Promise.all([
      this.rdStationService.postContact(
        rdStationPayloadPurifier(payload) as ContactPayload,
      ),
      this.learnWorldsService.syncUserProfile(payload.user.email),
    ]);
  }

  @OnEvent(Events.CLIENT_UPDATED, { async: true })
  handleClientUpdatedEvent(payload: any) {
    this.logger.log(`handle client started event: ${Events.CLIENT_UPDATED}`);

    return Promise.all([
      this.rdStationService.updateContact(
        rdStationPayloadPurifier(payload) as ContactPayload,
      ),
    ]);
  }
}
