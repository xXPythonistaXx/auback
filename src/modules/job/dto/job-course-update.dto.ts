import { IJobCourseUpdate } from '@shared/interfaces';
import { IsNotEmpty, IsOptional } from 'class-validator';

export class JobCourseUpdateDTO implements IJobCourseUpdate {
  @IsOptional()
  _id: string;

  @IsNotEmpty({ message: 'O id do curso é obrigatório.' })
  course: string;
}
