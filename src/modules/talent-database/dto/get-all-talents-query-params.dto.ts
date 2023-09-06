import { Transform } from 'class-transformer';
import { IsBoolean, IsOptional, IsString } from 'class-validator';
import {
  AcademicShift,
  HumanRace,
  Pcd,
  SexualOrientation,
  Studentship,
} from '../../../shared/enums';
import { PaginationDto } from '../../../shared/dto/pagination.dto';

class CourseId {
  @IsString()
  course: string;

  @IsOptional()
  period: number;
}

export class GetAllTalentsQueryParamsDto extends PaginationDto {
  @IsOptional()
  @Transform(({ value }) => value.map((item) => JSON.parse(item)))
  course_id?: CourseId[];

  @IsOptional()
  universityId?: string[];

  @IsOptional()
  isAvaliableForChange?: string;

  @IsOptional()
  email?: string;

  @IsOptional()
  name?: string;

  @IsOptional()
  @Transform(({ value }) => value.map((item: string) => JSON.parse(item)))
  languagesId?: string[];

  @IsOptional()
  @Transform(({ value }) => value.map((item: string) => JSON.parse(item)))
  toolId?: string[];

  @IsOptional()
  @Transform(({ value }) => value?.replace(/\s/g, '').toLowerCase())
  stateId?: string;

  @IsOptional()
  city?: string;

  @IsOptional()
  humanRace?: HumanRace[];

  @IsOptional()
  sexualOrientation?: SexualOrientation[];

  @IsOptional()
  studentship?: Studentship[];

  @IsOptional()
  pcd?: Pcd[];

  @IsOptional()
  @Transform(({ value }) => value === 'true')
  @IsBoolean()
  learningPath?: boolean;

  @IsOptional()
  @Transform(({ value }) => Number(value))
  conclusionYear?: number;

  @IsOptional()
  @Transform(({ value }) => Number(value))
  courseSemester?: number;

  @IsOptional()
  @Transform(({ value }) => value.map((item: string) => Number(item)))
  period?: number[];

  @IsOptional()
  shift?: AcademicShift[];

  @IsOptional()
  @Transform(({ value }) => (value === 'true' ? true : false))
  learnWorldsUserCourseCompleted?: boolean;

  @IsOptional()
  @Transform(({ value }) => Number(value))
  scholarshipPercentage?: number;

  @IsOptional()
  @Transform(({ value }) => Number(value))
  AgeMin?: number;

  @IsOptional()
  @Transform(({ value }) => Number(value))
  AgeMax?: number;
}
