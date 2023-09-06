import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { LanguageLevel } from '@shared/enums';
import { IJobLanguage } from '@shared/interfaces';
import { Document, SchemaTypes } from 'mongoose';
import { Language } from '../language.schema';

export type JobLanguageDocument = JobLanguage & Document;

@Schema()
export class JobLanguage implements IJobLanguage {
  _id: string;

  @Prop({ type: SchemaTypes.ObjectId, ref: Language.name, autopopulate: true })
  language: Language;

  @Prop()
  speaking?: LanguageLevel;

  @Prop()
  writing?: LanguageLevel;

  @Prop()
  reading?: LanguageLevel;
}

export const JobLanguageSchema = SchemaFactory.createForClass(JobLanguage);
