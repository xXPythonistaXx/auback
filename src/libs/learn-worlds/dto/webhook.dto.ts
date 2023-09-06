import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty } from 'class-validator';
import { User } from './user.dto';

export class WebhookDTO {
  @IsNotEmpty({ message: 'O type é obrigatório.' })
  @ApiProperty({
    description: 'Nome do método que ira ser chamado',
    example: 'courseCompleted',
  })
  type: string;

  data: {
    user: User;
  };
}
