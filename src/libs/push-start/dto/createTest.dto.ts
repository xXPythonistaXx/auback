import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty } from 'class-validator';

export class PushStartTestDTO {
  @IsNotEmpty({ message: 'O id é obrigatório.' })
  @ApiProperty({
    description: 'UUID cadastrado na plataforma',
    example: 'UUID',
  })
  employeeId: string;
}
