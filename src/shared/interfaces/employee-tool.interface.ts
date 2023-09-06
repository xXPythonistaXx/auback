import { Tool } from '@schemas';
import { ToolLevel } from '@shared/enums';
import { IToolPayload } from './tool.interface';

export interface IEmployeeTool {
  tool: Tool;
  level?: ToolLevel;
}

export interface IEmployeeToolUpdate
  extends Partial<Omit<IEmployeeTool, 'tool'>> {
  _id: string;
  tool: string;
}

export interface IEmployeeToolCreate
  extends Partial<Omit<IEmployeeTool, 'tool'>> {
  tool: string;
}

export interface IEmployeeToolPayload extends Omit<IEmployeeTool, 'tool'> {
  _id: string;
  tool: IToolPayload;
}
