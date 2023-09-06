import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { IAddress } from '@shared/interfaces';
import { Document, SchemaTypes } from 'mongoose';
import { State } from './state.schema';

@Schema()
export class Address implements IAddress {
  _id: string;

  @Prop()
  zipCode: string;

  @Prop()
  street: string;

  @Prop()
  number: string;

  @Prop()
  complement?: string;

  @Prop({ type: SchemaTypes.ObjectId, ref: 'State', autopopulate: true })
  state: State;

  @Prop()
  neighborhood: string;

  @Prop()
  city: string;

  @Prop()
  phoneNumber?: string;

  @Prop()
  cellphoneNumber?: string;
}

export type AddressDocument = Address & Document;

export const AddressSchema = SchemaFactory.createForClass(Address);
