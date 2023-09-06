import { IToolCreate } from '@shared/interfaces';
import { IsNotEmpty } from 'class-validator';

export class ToolCreateDTO implements IToolCreate {
  @IsNotEmpty({ message: 'O nome da ferramenta/curso é obrigatório.' })
  name: string;
}
