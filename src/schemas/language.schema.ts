import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { ILanguage } from '@shared/interfaces';
import { Document } from 'mongoose';

export type LanguageDocument = Language & Document;

@Schema()
export class Language implements ILanguage {
  _id: string;

  @Prop()
  name: string;
}

export const LanguageSchema = SchemaFactory.createForClass(Language);
