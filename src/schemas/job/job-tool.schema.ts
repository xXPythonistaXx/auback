import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { ToolLevel } from '@shared/enums';
import { IJobTool } from '@shared/interfaces';
import { Document, SchemaTypes } from 'mongoose';
import { Tool } from '../tool.schema';

export type JobToolDocument = JobTool & Document;

@Schema()
export class JobTool implements IJobTool {
  _id: string;

  @Prop({ type: SchemaTypes.ObjectId, ref: Tool.name, autopopulate: true })
  tool: Tool;

  @Prop()
  level?: ToolLevel;
}

export const JobToolSchema = SchemaFactory.createForClass(JobTool);
