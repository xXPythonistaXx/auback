import { IToolUpdate } from '@shared/interfaces';
import { IsNotEmpty } from 'class-validator';

export class ToolUpdateDTO implements IToolUpdate {
  @IsNotEmpty({ message: 'O id da ferramenta/curso é obrigatório.' })
  _id: string;

  @IsNotEmpty({ message: 'O nome da ferramenta/curso é obrigatório' })
  name: string;
}
