import { ICertificateCreate } from '@shared/interfaces';
import {
  IsDateString,
  IsNotEmpty,
  IsOptional,
  ValidateIf,
} from 'class-validator';

export class EmployeeCertificateCreateDTO implements ICertificateCreate {
  @IsNotEmpty({ message: 'O título do certificado é obrigatório' })
  name: string;

  @IsDateString()
  @ValidateIf((value) => value.date !== '')
  @IsOptional()
  date?: string;
}
