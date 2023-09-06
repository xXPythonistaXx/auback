import { IExperienceCreate } from '@shared/interfaces';
import {
  IsDateString,
  IsNotEmpty,
  IsOptional,
  ValidateIf,
} from 'class-validator';

export class EmployeeExperienceCreateDTO implements IExperienceCreate {
  @IsNotEmpty({ message: 'A empresa é obrigatório.' })
  employer: string;

  @IsNotEmpty({ message: 'O cargo é obrigatório.' })
  jobTitle: string;

  @IsDateString()
  @IsNotEmpty({ message: 'A data de início é obrigatória.' })
  startedAt: string;

  @IsDateString()
  @ValidateIf((value) => value.finishedAt !== '')
  @IsOptional()
  finishedAt?: string;

  @IsNotEmpty({ message: 'As atividades são obrigatórias.' })
  activities: string;
}
