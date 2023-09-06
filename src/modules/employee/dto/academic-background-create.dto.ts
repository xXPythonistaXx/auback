import {
  AcademicBackgroundStatus,
  AcademicBackgroundType,
  AcademicShift,
  Studentship,
  WhereStudiedHighSchool,
} from '@shared/enums';
import { IAcademicBackgroundCreate } from '@shared/interfaces';
import {
  IsDateString,
  IsEnum,
  IsNotEmpty,
  IsOptional,
  ValidateIf,
} from 'class-validator';

export class AcademicBackgroundCreateDTO implements IAcademicBackgroundCreate {
  @IsNotEmpty({ message: 'O nome da faculdade é obrigatório.' })
  university: string;

  @IsNotEmpty({ message: 'O nome do curso é obrigatório.' })
  course: string;

  @IsNotEmpty({ message: 'O período é obrigatório.' })
  period: number;

  @IsEnum(AcademicShift, { each: true })
  @IsNotEmpty({ message: 'O turno é obrigatório.' })
  shift: AcademicShift;

  @IsEnum(AcademicBackgroundType, { each: true })
  @IsNotEmpty({ message: 'O tipo é obrigatório.' })
  type: AcademicBackgroundType;

  @IsEnum(AcademicBackgroundStatus, { each: true })
  @IsNotEmpty({ message: 'O status do curso é obrigatório.' })
  status: AcademicBackgroundStatus;

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

  @IsEnum(WhereStudiedHighSchool, { each: true })
  @IsNotEmpty({ message: 'O status do curso é obrigatório.' })
  whereStudiedHighSchool: WhereStudiedHighSchool;

  @IsEnum(Studentship, { each: true })
  @IsNotEmpty({ message: 'O status do curso é obrigatório.' })
  scholarship: Studentship;

  @IsOptional()
  @IsNotEmpty({ message: 'A porcentagem de bolsa é obrigatório.' })
  scholarshipPercentage: number;
}
