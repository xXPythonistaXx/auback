import { Injectable, LoggerService } from '@nestjs/common';
import pino from 'pino';

@Injectable()
export class PinoService implements LoggerService {
  private readonly loggerInstance: pino.Logger;

  constructor() {
    this.loggerInstance = pino({
      name: 'au-backend',
      mixin() {
        return { env: process.env.NODE_ENV };
      },
    });
  }

  private logger(
    level: string,
    message: string,
    optionalParams?: object,
  ): void {
    if (typeof optionalParams === 'object') {
      this.loggerInstance[level]({ ...optionalParams }, message);
    } else {
      this.loggerInstance[level](message);
    }
  }

  log(message: string, optionalParams?: object): void {
    this.logger('info', message, optionalParams);
  }

  error(message: string, optionalParams?: object): void {
    this.logger('error', message, optionalParams);
  }

  warn(message: string, optionalParams?: object): void {
    this.logger('warn', message, optionalParams);
  }

  debug(message: string, optionalParams?: object): void {
    this.logger('debug', message, optionalParams);
  }
}
