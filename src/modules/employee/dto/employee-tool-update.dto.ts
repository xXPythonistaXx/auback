import { ToolLevel } from '@shared/enums';
import { IEmployeeToolUpdate } from '@shared/interfaces';
import { IsEnum, IsNotEmpty, IsOptional } from 'class-validator';

export class EmployeeToolUpdateDTO implements IEmployeeToolUpdate {
  @IsOptional()
  _id: string;

  @IsNotEmpty({ message: 'O id da ferramenta é obrigatório.' })
  tool: string;

  @IsEnum(ToolLevel, { each: true })
  @IsOptional()
  level?: ToolLevel;
}
