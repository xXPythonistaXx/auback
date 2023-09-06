import { Injectable } from '@nestjs/common';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { Events } from '@shared/enums/events-name.enum';

@Injectable()
export class EventsService {
  constructor(private readonly eventEmitter: EventEmitter2) {}

  emitEvent(event: Events, data: any) {
    return this.eventEmitter.emit(event, data);
  }

  onEvent(event: Events, listener: (...args: any[]) => void) {
    return this.eventEmitter.on(event, listener);
  }
}
