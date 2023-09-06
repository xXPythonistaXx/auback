import { ISegmentCreate } from '@shared/interfaces';
import { IsNotEmpty } from 'class-validator';

export class SegmentCreateDTO implements ISegmentCreate {
  @IsNotEmpty({ message: 'O nome do segmento é obrigatório.' })
  name: string;
}
