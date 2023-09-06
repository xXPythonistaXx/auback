import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { IBenefit } from '@shared/interfaces';
import { Document } from 'mongoose';

export type BenefitDocument = Benefit & Document;

@Schema()
export class Benefit implements IBenefit {
  @Prop({ trim: true })
  name: string;
}

export const BenefitSchema = SchemaFactory.createForClass(Benefit);
