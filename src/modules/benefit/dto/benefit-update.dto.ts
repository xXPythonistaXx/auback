import { IBenefitUpdate } from '@shared/interfaces';
import { IsNotEmpty } from 'class-validator';

export class BenefitUpdateDTO implements IBenefitUpdate {
  @IsNotEmpty({ message: 'O id do benefício é obrigatório.' })
  _id: string;

  @IsNotEmpty({ message: 'O nome do benefício é obrigatório' })
  name: string;
}
