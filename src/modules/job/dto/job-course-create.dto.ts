import { IJobCourseCreate } from '@shared/interfaces';
import { IsNotEmpty } from 'class-validator';

export class JobCourseCreateDTO implements IJobCourseCreate {
  @IsNotEmpty({ message: 'O id do curso é obrigatório.' })
  course: string;
}
