import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { IState } from '@shared/interfaces';
import { Document } from 'mongoose';

export type StateDocument = State & Document;

@Schema({ timestamps: true })
export class State implements IState {
  _id: string;

  @Prop()
  cod: number;

  @Prop()
  name: string;

  @Prop()
  abbreviated: string;
}

export const StateSchema = SchemaFactory.createForClass(State);
