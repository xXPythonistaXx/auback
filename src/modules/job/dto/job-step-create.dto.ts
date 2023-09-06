import { IJobStepCreate } from '@shared/interfaces';
import {
  IsBoolean,
  IsDateString,
  IsNotEmpty,
  IsOptional,
  ValidateIf,
} from 'class-validator';

export class JobStepCreateDTO implements IJobStepCreate {
  _id: string;

  @IsNotEmpty({ message: 'O nome da etapa é obrigatório.' })
  name: string;

  @IsOptional()
  jobId?: string;

  @IsOptional()
  lastStep?: boolean;

  @IsOptional()
  candidates?: string[];

  @IsOptional()
  order?: number;

  @IsOptional()
  approvedMessage?: string;

  @IsOptional()
  reprovedMessage?: string;

  @IsBoolean({ message: 'A propriedade closed precisa ser boolean.' })
  @IsOptional()
  closed?: boolean;

  @IsDateString()
  @ValidateIf((value) => value.finishAt !== '')
  @IsOptional()
  closedAt?: string;
}
