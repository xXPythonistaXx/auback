import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty } from 'class-validator';

export class RefreshTokenDTO {
  @IsNotEmpty({ message: 'O refresh token é obrigatório.' })
  @ApiProperty({
    description: 'Refresh token',
    example: 'JWT TOKEN',
  })
  refreshToken: string;
}
