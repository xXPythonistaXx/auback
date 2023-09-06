import { MongooseModule, MongooseModuleOptions } from '@nestjs/mongoose';
import { MongoMemoryServer } from 'mongodb-memory-server';

let mongo;

export const rootMongooseTestModule = (options: MongooseModuleOptions = {}) =>
  MongooseModule.forRootAsync({
    useFactory: async () => {
      mongo = await MongoMemoryServer.create();
      const uri = mongo.getUri();
      return {
        uri,
        ...options,
      };
    },
  });

export const closeInMongodConnection = async () => {
  if (mongo) await mongo.stop();
};
