import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { IBenefit, IEmployerProfile, ISegment } from '@shared/interfaces';
import { Document, SchemaTypes } from 'mongoose';
import { Benefit } from '../benefit.schema';
import { Segment } from '../segment.schema';

export type EmployerProfileDocument = EmployerProfile & Document;

@Schema()
export class EmployerProfile implements IEmployerProfile {
  _id: string;

  @Prop({ trim: true })
  companyDescription?: string;

  @Prop({ trim: true })
  companyPurpose?: string;

  @Prop({ trim: true })
  companyValues?: string;

  @Prop({ trim: true })
  cuturalCharacteristcs?: string;

  @Prop({ trim: true })
  websiteUrl?: string;

  @Prop({ trim: true })
  socialUrl?: string;

  @Prop({
    type: SchemaTypes.ObjectId,
    ref: Segment.name,
    autopopulate: true,
  })
  segment?: ISegment;

  @Prop({
    type: [
      {
        type: SchemaTypes.ObjectId,
        ref: Benefit.name,
        autopopulate: true,
      },
    ],
  })
  benefits?: IBenefit[];
}

export const EmployerProfileSchema =
  SchemaFactory.createForClass(EmployerProfile);
