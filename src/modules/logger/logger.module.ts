import { Module } from '@nestjs/common';
import { PinoService } from './pino.service';

@Module({
  providers: [PinoService],
  exports: [PinoService],
})
export class LoggerModule {}
