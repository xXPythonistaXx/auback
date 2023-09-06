import { Transform } from 'class-transformer';
import { IsOptional, IsString } from 'class-validator';

class CourseId {
  @IsString()
  course: string;

  @IsOptional()
  period: number;
}

export class JobStepFilterDTO {
  @IsOptional()
  name?: string;

  @IsOptional()
  scholarshipPercentage?: string;

  @IsOptional()
  email?: string;

  @IsOptional()
  humanRace?: string[];

  @IsOptional()
  isAvaliableForChange?: string;

  @IsOptional()
  pcd?: string[];

  @IsOptional()
  sexualOrientation?: string[];

  @IsOptional()
  @Transform(({ value }) => parseInt(value))
  psMinScore?: number;

  @IsOptional()
  @Transform(({ value }) => parseInt(value))
  psMaxScore?: number;

  @IsOptional()
  @Transform(({ value }) => value.map((item) => JSON.parse(item)))
  course_id?: CourseId[];

  @IsOptional()
  learnWorldsUserCourseCompleted?: string;

  @IsOptional()
  @Transform(({ value }) => value.map((item: string) => JSON.parse(item)))
  tools?: string[];

  @IsOptional()
  @Transform(({ value }) => value.map((item: string) => JSON.parse(item)))
  languages?: string[];

  @IsOptional()
  shift?: string[];

  @IsOptional()
  period?: string[];

  @IsOptional()
  university_id?: string;

  @IsOptional()
  state?: string;

  @IsOptional()
  city?: string;

  @IsOptional()
  q?: string;

  @IsOptional()
  status?: string;
}
