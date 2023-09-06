import { ToolLevel } from '@shared/enums';
import { IJobToolCreate } from '@shared/interfaces/job-tool.interface';
import { IsEnum, IsNotEmpty, IsOptional } from 'class-validator';

export class JobToolCreateDTO implements IJobToolCreate {
  @IsNotEmpty({ message: 'O id da ferramenta é obrigatório.' })
  tool: string;

  @IsEnum(ToolLevel, { each: true })
  @IsOptional()
  level?: ToolLevel;
}
