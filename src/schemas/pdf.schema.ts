import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import * as interfaces from '@shared/interfaces';
import { Document } from 'mongoose';

export type PdfDocument = interfaces.IPdf & Document;

@Schema()
export class IPdf implements interfaces.IPdf {
  _id: string;

  @Prop({ trim: true })
  key?: string;

  @Prop({ trim: true })
  location: string;
}

export const IPdfSchema = SchemaFactory.createForClass(IPdf);
