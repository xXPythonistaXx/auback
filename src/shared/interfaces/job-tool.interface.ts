import { Tool } from '@schemas';
import { ToolLevel } from '@shared/enums';
import { IToolPayload } from './tool.interface';

export interface IJobTool {
  tool: Tool;
  level?: ToolLevel;
}

export interface IJobToolUpdate extends Partial<Omit<IJobTool, 'tool'>> {
  _id: string;
  tool: string;
}

export interface IJobToolCreate extends Partial<Omit<IJobTool, 'tool'>> {
  tool: string;
}

export interface IJobToolPayload extends Omit<IJobTool, 'tool'> {
  _id: string;
  tool: IToolPayload;
}
