import { IsCnpjValid } from '@shared/decorators';
import { IEmployer } from '@shared/interfaces';
import { IsEmail, IsNotEmpty } from 'class-validator';

export class LocalEmployerSignupDTO implements Omit<IEmployer, '_id' | 'user'> {
  @IsCnpjValid({ message: 'O CNPJ $value é inválido.' })
  @IsNotEmpty({ message: 'O CNPJ é obrigatório.' })
  cnpj: string;

  @IsNotEmpty({ message: 'A razão social é obrigatória.' })
  corporateName: string;

  @IsEmail({}, { message: 'O email é inválido.' })
  @IsNotEmpty({ message: 'O email é obrigatório.' })
  email: string;

  @IsNotEmpty({ message: 'A senha é obrigatória.' })
  password: string;
}
