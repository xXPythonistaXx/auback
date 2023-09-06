import { ICertificateUpdate } from '@shared/interfaces';
import {
  IsDateString,
  IsNotEmpty,
  IsOptional,
  ValidateIf,
} from 'class-validator';

export class EmployeeCertificateUpdateDTO implements ICertificateUpdate {
  @IsOptional()
  _id: string;

  @IsNotEmpty({ message: 'O título do certificado é obrigatório' })
  name: string;

  @IsDateString()
  @ValidateIf((value) => value.date !== '')
  @IsOptional()
  date?: string;
}
