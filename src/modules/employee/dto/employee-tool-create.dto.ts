import { ToolLevel } from '@shared/enums';
import { IEmployeeToolCreate } from '@shared/interfaces';
import { IsEnum, IsNotEmpty, IsOptional } from 'class-validator';

export class EmployeeToolCreateDTO implements IEmployeeToolCreate {
  @IsNotEmpty({ message: 'O id da ferramenta é obrigatório.' })
  tool: string;

  @IsEnum(ToolLevel, { each: true })
  @IsOptional()
  level?: ToolLevel;
}
