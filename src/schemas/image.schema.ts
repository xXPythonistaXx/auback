import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { IImage } from '@shared/interfaces';
import { Document } from 'mongoose';

export type ImageDocument = Image & Document;

@Schema()
export class Image implements IImage {
  _id: string;

  @Prop({ trim: true })
  key?: string;

  @Prop({ trim: true })
  location: string;
}

export const ImageSchema = SchemaFactory.createForClass(Image);
