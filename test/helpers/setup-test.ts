import { ConfigModule } from '@nestjs/config';
import { validationSchema } from '../../src/config';
import { LoggerModule } from '../../src/modules/logger/logger.module';

export const SetupTestModule = [
  LoggerModule,
  ConfigModule.forRoot({
    validationSchema: validationSchema,
    validationOptions: {
      abortEarly: true,
    },
    isGlobal: true,
    expandVariables: true,
    envFilePath: ['.env.test'],
  }),
];
