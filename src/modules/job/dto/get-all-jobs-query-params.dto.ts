import { Transform } from 'class-transformer';
import { IsBoolean, IsString, IsOptional } from 'class-validator';
import { PaginationDto } from '../../../shared/dto/pagination.dto';
import { InternshipModel } from '@shared/enums';

export class GetAllJobsQueryParamsDto extends PaginationDto {
  @IsOptional()
  title?: string;

  @IsOptional()
  benefits?: string[];

  @IsOptional()
  @Transform(({ value }) => value?.replace(/\s/g, '').toLowerCase())
  state?: string;

  @IsOptional()
  city?: string;

  @IsOptional()
  @Transform(({ value }) => value.toUpperCase())
  @IsString()
  status?: string;

  @IsOptional()
  @Transform(({ value }) => value === 'true')
  @IsBoolean()
  closed?: boolean;

  @IsOptional()
  @Transform(({ value }) => Number(value))
  minInternshipValue?: number;

  @IsOptional()
  @Transform(({ value }) => Number(value))
  maxInternshipValue?: number;

  @IsOptional()
  @IsBoolean()
  @Transform(({ value }) => value === 'true')
  withCandidate?: boolean;

  @IsOptional()
  jobModel?: InternshipModel[];

  @IsOptional()
  @Transform(({ value }) => Number(value))
  AgeMin?: number;

  @IsOptional()
  @Transform(({ value }) => Number(value))
  AgeMax?: number;

  @IsOptional()
  @Transform(({ value }) => value === 'true')
  @IsBoolean()
  withMacroJob?: boolean;
}
