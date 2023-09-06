import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty } from 'class-validator';

export class RequestResetPasswordDTO {
  @ApiProperty({
    description:
      'Email do usuário para encaminhar as instruções para resetar a senha',
    example: 'jhon.due@email.com',
  })
  @IsNotEmpty({ message: 'O email é obrigatório.' })
  email: string;
}

export class ResetPasswordDTO {
  @IsNotEmpty({ message: 'O novo password é obrigatório.' })
  @ApiProperty({
    description: 'Nova senha do usuário',
    example: 'abc@123',
  })
  newPassword: string;
}

export default class QueryResetPasswordDTO {
  @ApiProperty({
    description: 'Token gerando',
    example: 'JWT Token',
  })
  token: string;

  @ApiProperty({
    description: 'User ID do user',
    example: 'ID-MD5',
  })
  userId: string;
}
