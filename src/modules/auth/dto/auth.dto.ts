import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString } from 'class-validator';

export class SocialSigninDTO {
  @IsNotEmpty({ message: 'O token é obrigatório.' })
  @IsString({ message: 'O token precisa ser uma string.' })
  @ApiProperty({
    description: 'Social token gerado por alguma provedor de login',
    example: 'Social Token',
  })
  token: string;
}
