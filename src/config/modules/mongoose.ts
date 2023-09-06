/* eslint-disable @typescript-eslint/no-unsafe-return */
/* eslint-disable @typescript-eslint/no-unsafe-call */
import { ConfigModule, ConfigService } from '@nestjs/config';
import { MongooseModuleOptions } from '@nestjs/mongoose';
import { CONFIG } from '../configuration.enum';
import { accessibleRecordsPlugin } from '@casl/mongoose';

import * as mongoosePaginate from 'mongoose-paginate-v2';
import * as mongooseAutopopulate from 'mongoose-autopopulate';
import * as mongooseAgreggatePaginate from 'mongoose-aggregate-paginate-v2';

export const mongooseConfig: MongooseModuleOptions = {
  imports: [ConfigModule],
  useFactory: (configService: ConfigService) => ({
    uri: configService.get<string>(CONFIG.MONGODB_URI),
    connectionFactory: (connection: any) => {
      connection.plugin(accessibleRecordsPlugin);
      connection.plugin(mongoosePaginate);
      connection.plugin(mongooseAutopopulate);
      connection.plugin(mongooseAgreggatePaginate);

      return connection;
    },
  }),
  inject: [ConfigService],
};
