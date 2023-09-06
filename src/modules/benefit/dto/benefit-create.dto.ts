import { ApiProperty } from '@nestjs/swagger';
import { IBenefitCreate } from '@shared/interfaces';
import { IsNotEmpty } from 'class-validator';

export class BenefitCreateDTO implements IBenefitCreate {
  @ApiProperty({
    description: 'Nome do beneficio',
    example: 'Vale Alimentação',
  })
  @IsNotEmpty({ message: 'O nome do benefício é obrigatório.' })
  name: string;
}
