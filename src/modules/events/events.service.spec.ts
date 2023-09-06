import { Test, TestingModule } from '@nestjs/testing';
import { EventsService } from './events.service';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { Events } from '@shared/enums';

describe('EventsService', () => {
  let sut: EventsService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        EventsService,
        {
          provide: EventEmitter2,
          useValue: {
            emit: jest.fn(),
          },
        },
      ],
    }).compile();

    sut = module.get<EventsService>(EventsService);
  });

  it('should be defined', () => {
    expect(sut).toBeDefined();
  });

  describe('emitEvent', () => {
    it('should call eventEmitter with corrects event names', () => {
      const eventsName = Object.values(Events);
      const eventEmitter = jest.spyOn(sut, 'emitEvent');

      eventsName.forEach((event) => {
        sut.emitEvent(event, {});
        expect(eventEmitter).toHaveBeenCalledWith(event, {});
      });
    });
  });
});
