import { ToolLevel } from '@shared/enums';
import { IJobToolUpdate } from '@shared/interfaces/job-tool.interface';
import { IsEnum, IsNotEmpty, IsOptional } from 'class-validator';

export class JobToolUpdateDTO implements IJobToolUpdate {
  @IsOptional()
  _id: string;

  @IsNotEmpty({ message: 'O id da ferramenta é obrigatório.' })
  tool: string;

  @IsEnum(ToolLevel, { each: true })
  @IsOptional()
  level?: ToolLevel;
}
