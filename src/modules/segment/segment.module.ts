import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { Segment, SegmentSchema } from '@schemas';
import { SegmentController } from './segment.controller';
import { SegmentService } from './segment.service';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: Segment.name, schema: SegmentSchema }]),
  ],
  controllers: [SegmentController],
  providers: [SegmentService],
})
export class SegmentModule {}
