import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { ITool } from '@shared/interfaces';
import { Document } from 'mongoose';

export type ToolDocument = Tool & Document;

@Schema()
export class Tool implements ITool {
  _id: string;

  @Prop()
  name: string;
}

export const ToolSchema = SchemaFactory.createForClass(Tool);
