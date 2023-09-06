import { IExperienceUpdate } from '@shared/interfaces';
import { IsDateString, IsOptional, ValidateIf } from 'class-validator';

export class EmployeeExperienceUpdateDTO implements IExperienceUpdate {
  @IsOptional()
  _id: string;

  @IsOptional()
  employer: string;

  @IsOptional()
  jobTitle: string;

  @IsDateString()
  @ValidateIf((value) => value.startedAt !== '')
  @IsOptional()
  startedAt: string;

  @IsDateString()
  @ValidateIf((value) => value.finishedAt !== '')
  @IsOptional()
  finishedAt?: string;

  @IsOptional()
  activities: string;
}
