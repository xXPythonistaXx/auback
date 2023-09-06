import { State } from '@schemas';

export interface IAddress {
  zipCode: string;
  street: string;
  number: string;
  complement?: string;
  state: State;
  neighborhood: string;
  city: string;
  phoneNumber?: string;
  cellphoneNumber?: string;
}

export interface IAddressCreate extends Omit<IAddress, 'state'> {
  state: string;
}

export interface IAddressUpdate extends Partial<Omit<IAddress, 'state'>> {
  _id?: string;
  state?: string;
}
export interface IAddressPayload extends IAddress {
  _id: string;
}
