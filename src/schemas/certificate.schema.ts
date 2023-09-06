import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { ICertificate } from '@shared/interfaces';
import { Document } from 'mongoose';

export type CertificateDocument = Certificate & Document;

@Schema()
export class Certificate implements ICertificate {
  @Prop()
  name: string;

  @Prop()
  date: string;
}

export const CertificateSchema = SchemaFactory.createForClass(Certificate);
