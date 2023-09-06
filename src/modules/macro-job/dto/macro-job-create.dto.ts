import {
  IsDateString,
  IsNotEmpty,
  IsOptional,
  IsString,
  ValidateIf,
  ValidateNested,
} from 'class-validator';
import { Transform, Type } from 'class-transformer';
import { JobCreateDTO } from '@modules/job/dto/job-create.dto';
import moment from 'moment';

export class MacroJobCreateDTO {
  _id: string;

  @IsString()
  @IsNotEmpty({ message: 'O título da macroárea é obrigatório.' })
  title: string;

  @IsString()
  @IsNotEmpty({ message: 'A descrição da macroárea é obrigatória.' })
  description: string;

  @IsString()
  @IsOptional()
  slug: string;

  @ValidateIf((value) => value.endAt !== '')
  @Transform(({ value }) =>
    moment.tz(value, 'YYYY-MM-DD', 'America/Sao_Paulo').endOf('day'),
  )
  @IsOptional()
  endAt?: Date;

  @IsDateString()
  @ValidateIf((value) => value.endAt !== '')
  @IsOptional()
  closedAt?: string;

  @ValidateNested({ each: true })
  @Type(() => JobCreateDTO)
  @IsOptional()
  jobs?: JobCreateDTO[];

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
