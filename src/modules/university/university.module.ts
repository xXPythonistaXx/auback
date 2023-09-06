import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { University, UniversitySchema } from '@schemas';
import { UniversityService } from './university.service';
import { UniversityController } from './university.controller';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: University.name, schema: UniversitySchema },
    ]),
  ],
  providers: [UniversityService],
  controllers: [UniversityController],
})
export class UniversityModule {}
