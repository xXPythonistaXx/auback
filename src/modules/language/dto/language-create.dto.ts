import { ILanguageCreate } from '@shared/interfaces';
import { IsNotEmpty } from 'class-validator';

export class LanguageCreateDTO implements ILanguageCreate {
  @IsNotEmpty({ message: 'O nome do idioma é obrigatório.' })
  name: string;
}
