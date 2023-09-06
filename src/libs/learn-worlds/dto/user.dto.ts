import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty } from 'class-validator';

export class User {
  @IsNotEmpty({ message: 'O id é obrigatório.' })
  @ApiProperty({
    description: 'UUID cadastrado na plataforma',
    example: 'UUID',
  })
  id: string;

  @IsNotEmpty({ message: 'O type é obrigatório.' })
  @ApiProperty({
    description: 'Email do candidato cadastrado na plataforma',
    example: 'john@doe.com',
  })
  email: string;
}
