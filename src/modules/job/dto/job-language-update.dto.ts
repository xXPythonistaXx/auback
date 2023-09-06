import { LanguageLevel } from '@shared/enums';
import { IJobLanguageUpdate } from '@shared/interfaces';
import { IsEnum, IsNotEmpty, IsOptional } from 'class-validator';

export class JobLanguageUpdateDTO implements IJobLanguageUpdate {
  @IsOptional()
  _id: string;

  @IsNotEmpty({ message: 'O id do idioma é obrigatório.' })
  language: string;

  @IsEnum(LanguageLevel, { each: true })
  @IsOptional()
  speaking?: LanguageLevel;

  @IsEnum(LanguageLevel, { each: true })
  @IsOptional()
  writing?: LanguageLevel;

  @IsEnum(LanguageLevel, { each: true })
  @IsOptional()
  reading?: LanguageLevel;
}
