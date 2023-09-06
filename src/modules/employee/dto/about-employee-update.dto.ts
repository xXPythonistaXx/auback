import {
  FamilyIncome,
  HumanRace,
  InternshipModel,
  LivingPlace,
  Pcd,
  SexualOrientation,
  Studentship,
  WhereStudiedHighSchool,
} from '@shared/enums';
import { IAboutEmployee } from '@shared/interfaces';
import { IsEnum, IsOptional } from 'class-validator';

export class EmployeeAboutDTO implements IAboutEmployee {
  @IsOptional()
  resume?: string;

  @IsOptional()
  videoUrl?: string;

  @IsOptional()
  internshipModel: InternshipModel[];

  @IsEnum(HumanRace, { each: true })
  @IsOptional()
  humanRace?: HumanRace;

  @IsEnum(SexualOrientation, { each: true })
  @IsOptional()
  sexualOrientation?: SexualOrientation;

  @IsEnum(Pcd, { each: true })
  @IsOptional()
  pcd?: Pcd;

  @IsEnum(LivingPlace, { each: true })
  @IsOptional()
  livingPlace?: LivingPlace;

  @IsEnum(WhereStudiedHighSchool, { each: true })
  @IsOptional()
  whereStudiedHighSchool?: WhereStudiedHighSchool;

  @IsEnum(FamilyIncome, { each: true })
  @IsOptional()
  familyIncome?: FamilyIncome;

  @IsEnum(Studentship, { each: true })
  @IsOptional()
  studentship?: Studentship;
}
