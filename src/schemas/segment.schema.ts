import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { ISegment } from '@shared/interfaces';
import { Document } from 'mongoose';

export type SegmentDocument = Segment & Document;

@Schema()
export class Segment implements ISegment {
  @Prop({ trim: true })
  name: string;
}

export const SegmentSchema = SchemaFactory.createForClass(Segment);
