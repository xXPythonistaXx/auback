import { IAddressUpdate } from '@shared/interfaces';
import { IsOptional } from 'class-validator';

export class EmployerAddressUpdateDTO implements IAddressUpdate {
  @IsOptional()
  _id?: string;

  @IsOptional()
  zipCode?: string;

  @IsOptional()
  street?: string;

  @IsOptional()
  number?: string;

  @IsOptional()
  complement?: string;

  @IsOptional()
  state?: string;

  @IsOptional()
  neighborhood?: string;

  @IsOptional()
  city?: string;

  @IsOptional()
  phoneNumber?: string;

  @IsOptional()
  cellphoneNumber?: string;
}
