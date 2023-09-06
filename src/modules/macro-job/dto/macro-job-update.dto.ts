import {
  IsNotEmpty,
  IsString,
  ValidateNested,
  IsOptional,
  IsDateString,
  ValidateIf,
} from 'class-validator';
import { Transform, Type } from 'class-transformer';
import { JobUpdateDTO } from '@modules/job/dto/job-update.dto';

export class MacroJobUpdateDTO {
  @IsString()
  @IsNotEmpty({ message: 'O título da macroárea é obrigatório.' })
  @IsOptional()
  title?: string;

  @IsString()
  @IsNotEmpty({ message: 'A descrição da macroárea é obrigatória.' })
  @IsOptional()
  description?: string;

  @ValidateIf((value) => value.finishAt !== '')
  @Transform(({ value }) => new Date(value))
  @IsOptional()
  finishAt?: Date;

  @IsDateString()
  @ValidateIf((value) => value.finishAt !== '')
  @IsOptional()
  closedAt?: string;

  @IsString()
  @IsOptional()
  slug?: string;

  @ValidateNested({ each: true })
  @Type(() => JobUpdateDTO)
  @IsOptional()
  jobs?: JobUpdateDTO[];

  @IsString()
  @IsOptional()
  iconUrl?: string;

  @IsString()
  @IsOptional()
  backgroundUrl?: string;

  @IsString()
  @IsOptional()
  responsable?: string;
}
