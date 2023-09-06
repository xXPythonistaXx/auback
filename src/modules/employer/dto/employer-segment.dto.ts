import { IsNotEmpty } from 'class-validator';

export class EmployerSegmentDTO {
  @IsNotEmpty({ message: 'O id do segmento é obrigatório.' })
  _id: string;
}
