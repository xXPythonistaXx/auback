import { IsNotEmpty } from 'class-validator';

export class JobApplyDTO {
  @IsNotEmpty({ message: 'Campo obrigatório.' })
  howDidGetThisJob: string;
}
