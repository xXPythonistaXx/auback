import { IsCpfValid } from '@shared/decorators';
import { AvailabilityForChange } from '@shared/enums';
import {
  IEmployeeLanguageUpdate,
  IEmployeeToolUpdate,
  IEmployeeUpdate,
  IImage,
} from '@shared/interfaces';
import { Transform, Type } from 'class-transformer';
import {
  IsEmail,
  IsEnum,
  IsOptional,
  IsString,
  ValidateNested,
} from 'class-validator';
import { EmployeeAboutDTO } from './about-employee-update.dto';
import { AcademicBackgroundUpdateDTO } from './academic-background-update.dto';
import { EmployeeExperienceUpdateDTO } from './employee-experience-update.dto';

export class EmployeeUpdateDTO implements IEmployeeUpdate {
  @IsCpfValid({ message: 'O CPF $value é inválido.' })
  @IsOptional()
  cpf: string;

  @IsString({ message: 'O primeiro nome precisa ser uma string.' })
  @IsOptional()
  firstName: string;

  @IsString({ message: 'O último nome precisa ser uma string.' })
  @IsOptional()
  lastName: string;

  @IsEmail({}, { message: 'O email é inválido.' })
  @IsOptional()
  email: string;

  @IsOptional()
  active?: boolean;

  @IsOptional()
  phoneNumber?: string;

  @IsOptional()
  salaryExpectation?: number;

  @IsEnum(AvailabilityForChange, { each: true })
  @IsOptional()
  isAvailableForChange?: AvailabilityForChange;

  @IsOptional()
  isUniversityStudent?: boolean;

  @IsOptional()
  linkedinUrl?: string;

  @IsOptional()
  instagramUrl?: string;

  @IsOptional()
  portfolioUrl?: string;

  @IsOptional()
  city?: string;

  @IsOptional()
  state?: string;

  @ValidateNested()
  @Type(() => EmployeeAboutDTO)
  @IsOptional()
  about?: EmployeeAboutDTO;

  @ValidateNested()
  @Type(() => AcademicBackgroundUpdateDTO)
  @IsOptional()
  academicBackgrounds?: AcademicBackgroundUpdateDTO[];

  @ValidateNested()
  @Type(() => EmployeeExperienceUpdateDTO)
  @IsOptional()
  experiences?: EmployeeExperienceUpdateDTO[];

  @IsOptional()
  tools?: IEmployeeToolUpdate[];

  @IsOptional()
  languages?: IEmployeeLanguageUpdate[];

  @IsOptional()
  @Transform(({ value }) => {
    return Buffer.from(value as string, 'base64');
  })
  image: IImage;

  @IsOptional()
  externalId: number;
}
