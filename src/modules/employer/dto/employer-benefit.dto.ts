import { IsString, IsNotEmpty } from 'class-validator';

export class EmployerBenefitDTO {
  @IsString({ each: true, message: 'Os ids precisam ser um array de strings.' })
  @IsNotEmpty({ message: 'Os ids de benefícios são obrigatórios.' })
  _ids: string[];
}
