import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { LanguageLevel } from '@shared/enums';
import { IEmployeeLanguage } from '@shared/interfaces';
import { Document, SchemaTypes } from 'mongoose';
import { Language } from '../language.schema';

export type EmployeeLanguageDocument = EmployeeLanguage & Document;

@Schema()
export class EmployeeLanguage implements IEmployeeLanguage {
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

export const EmployeeLanguageSchema =
  SchemaFactory.createForClass(EmployeeLanguage);
