import { IEmployerProfileUpdate } from '@shared/interfaces';
import { IsOptional } from 'class-validator';

export class EmployerProfileDTO implements IEmployerProfileUpdate {
  @IsOptional()
  companyDescription?: string;

  @IsOptional()
  companyPurpose?: string;

  @IsOptional()
  companyValues?: string;

  @IsOptional()
  cuturalCharacteristcs?: string;

  @IsOptional()
  websiteUrl?: string;

  @IsOptional()
  socialUrl?: string;

  @IsOptional()
  segment?: string;

  @IsOptional()
  benefits?: string[];
}
