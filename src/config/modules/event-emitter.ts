import { EventEmitterModuleOptions } from '@nestjs/event-emitter/dist/interfaces';

export const eventEmitterConfig: EventEmitterModuleOptions = {
  wildcard: true,
  delimiter: '.',
  newListener: false,
  removeListener: false,
  maxListeners: 10,
  verboseMemoryLeak: false,
  ignoreErrors: true,
};
