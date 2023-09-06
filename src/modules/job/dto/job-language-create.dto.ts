import { LanguageLevel } from '@shared/enums';
import { IJobLanguageCreate } from '@shared/interfaces';
import { IsEnum, IsNotEmpty, IsOptional } from 'class-validator';

export class JobLanguageCreateDTO implements IJobLanguageCreate {
  @IsNotEmpty({ message: 'O idioma é obrigatório.' })
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
