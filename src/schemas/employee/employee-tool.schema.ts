import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { ToolLevel } from '@shared/enums';
import { IEmployeeTool } from '@shared/interfaces';
import { Document, SchemaTypes } from 'mongoose';
import { Tool } from '../tool.schema';

export type EmployeeToolDocument = EmployeeTool & Document;

@Schema()
export class EmployeeTool implements IEmployeeTool {
  _id: string;

  @Prop({ type: SchemaTypes.ObjectId, ref: Tool.name, autopopulate: true })
  tool: Tool;

  @Prop()
  level?: ToolLevel;
}

export const EmployeeToolSchema = SchemaFactory.createForClass(EmployeeTool);
