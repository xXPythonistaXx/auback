import { ILanguageUpdate } from '@shared/interfaces';
import { IsNotEmpty } from 'class-validator';

export class LanguageUpdateDTO implements ILanguageUpdate {
  @IsNotEmpty({ message: 'O id do idioma é obrigatório.' })
  _id: string;

  @IsNotEmpty({ message: 'O nome do idioma é obrigatório.' })
  name: string;
}
