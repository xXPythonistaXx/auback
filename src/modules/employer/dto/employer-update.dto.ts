import { IsCnpjValid } from '@shared/decorators';
import { IEmployerUpdate } from '@shared/interfaces';
import { Type } from 'class-transformer';
import { IsBoolean, IsOptional, ValidateNested } from 'class-validator';
import { EmployerProfileDTO } from './employer-profile.dto';

export class EmployerUpdateDTO implements IEmployerUpdate {
  @IsCnpjValid({ message: 'O CNPJ $value é inválido.' })
  @IsOptional()
  cnpj: string;

  @IsOptional()
  corporateName: string;

  @IsOptional()
  businessName?: string;

  @ValidateNested()
  @Type(() => EmployerProfileDTO)
  @IsOptional()
  profile?: EmployerProfileDTO;

  @IsBoolean({ message: 'O campo active precisa ser boolean' })
  @IsOptional()
  active?: boolean;
}
