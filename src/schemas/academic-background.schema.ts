import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import {
  AcademicBackgroundStatus,
  AcademicBackgroundType,
  AcademicShift,
  Studentship,
  WhereStudiedHighSchool,
} from '@shared/enums';
import { IAcademicBackground } from '@shared/interfaces';
import { Document, SchemaTypes } from 'mongoose';
import { University } from './university.schema';

export type AcademicBackgroundDocument = AcademicBackground & Document;

@Schema({ collection: 'academic_backgrounds' })
export class AcademicBackground implements IAcademicBackground {
  @Prop()
  course: string;

  @Prop()
  period: number;

  @Prop()
  startDate: Date;

  @Prop()
  endDate: Date;

  @Prop()
  shift: AcademicShift;

  @Prop()
  type: AcademicBackgroundType;

  @Prop({ type: SchemaTypes.String })
  status: AcademicBackgroundStatus;

  @Prop()
  finishedAt?: string;

  @Prop()
  availableToChangeShift?: boolean;

  @Prop()
  isPartOfJuniorEmploye?: boolean;

  @Prop()
  juniorEmployer?: string;

  @Prop({
    type: SchemaTypes.ObjectId,
    ref: University.name,
    autopopulate: true,
  })
  university: University;

  @Prop({ type: SchemaTypes.String })
  whereStudiedHighSchool: WhereStudiedHighSchool;

  @Prop({ type: SchemaTypes.String })
  scholarship: Studentship;

  @Prop({
    default: 0,
  })
  scholarshipPercentage: number;
}

export const AcademicBackgroundSchema =
  SchemaFactory.createForClass(AcademicBackground);
