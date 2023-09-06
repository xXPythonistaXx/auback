import {
  AcademicBackgroundStatus,
  AcademicBackgroundType,
  AcademicShift,
  Studentship,
  WhereStudiedHighSchool,
} from '@shared/enums';
import { IAcademicBackgroundUpdate } from '@shared/interfaces';
import { Transform } from 'class-transformer';
import {
  IsDateString,
  IsEnum,
  IsNotEmpty,
  IsOptional,
  ValidateIf,
} from 'class-validator';

export class AcademicBackgroundUpdateDTO implements IAcademicBackgroundUpdate {
  @IsNotEmpty({ message: 'O id da formação é obrigatório.' })
  _id: string;

  @IsOptional()
  university: string;

  @IsOptional()
  course: string;

  @IsOptional()
  @IsDateString()
  @ValidateIf((value) => value.startDate !== '')
  startDate: string;

  @IsOptional()
  @IsDateString()
  @ValidateIf((value) => value.endDate !== '')
  endDate: string;

  @IsOptional()
  period: number;

  @IsEnum(AcademicShift, { each: true })
  shift: AcademicShift;

  @IsEnum(AcademicBackgroundType, { each: true })
  @IsOptional()
  type?: AcademicBackgroundType;

  @IsEnum(AcademicBackgroundStatus, { each: true })
  @IsOptional()
  status?: AcademicBackgroundStatus;

  @IsDateString()
  @ValidateIf((value) => value.finishedAt !== '')
  @IsOptional()
  finishedAt?: string;

  @IsOptional()
  availableToChangeShift?: boolean;

  @IsOptional()
  isPartOfJuniorEmploye?: boolean;

  @IsOptional()
  juniorEmployer?: string;

  @IsOptional()
  whereStudiedHighSchool: WhereStudiedHighSchool;

  @IsOptional()
  scholarship: Studentship;

  @IsOptional()
  @Transform(({ value }) => Number(value))
  scholarshipPercentage: number;
}
