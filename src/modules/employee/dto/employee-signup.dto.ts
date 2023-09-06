import { IsCpfValid } from '@shared/decorators';
import { IEmployee } from '@shared/interfaces';
import { IsEmail, IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class LocalEmployeeSignupDTO implements Omit<IEmployee, '_id' | 'user'> {
  @IsCpfValid({ message: 'O CPF $value é inválido.' })
  @IsOptional()
  cpf: string;

  @IsNotEmpty({ message: 'O primeiro nome é obrigatório.' })
  firstName: string;

  @IsNotEmpty({ message: 'O último nome é obrigatório.' })
  lastName: string;

  @IsEmail({}, { message: 'O email é inválido.' })
  @IsNotEmpty({ message: 'O email é obrigatório.' })
  email: string;

  @IsNotEmpty({ message: 'A senha é obrigatória.' })
  password: string;
}

export class SocialSignupDTO {
  @IsNotEmpty({ message: 'O token é obrigatório.' })
  @IsString({ message: 'O token precisa ser uma string.' })
  token: string;
}
