import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { AcademicBackgroundType } from '@shared/enums';
import { ICourse } from '@shared/interfaces';
import { Document } from 'mongoose';

export type CourseDocument = Course & Document;

@Schema({ timestamps: true })
export class Course implements ICourse {
  _id: string;

  @Prop()
  name: string;

  @Prop()
  codigo: string;

  @Prop()
  tipoCurso: AcademicBackgroundType;
}

export const CourseSchema = SchemaFactory.createForClass(Course);
