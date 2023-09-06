import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { ISubject } from '@shared/interfaces';
import { Document } from 'mongoose';

export type SubjectDocument = Subject & Document;

@Schema({ timestamps: true })
export class Subject implements ISubject {
  _id: string;

  @Prop({ unique: true, trim: true, lowercase: true })
  name: string;
}

export const SubjectSchema = SchemaFactory.createForClass(Subject);
