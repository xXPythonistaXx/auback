import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { IEmployeePayload, IParticipants } from '../../shared/interfaces';
import { SchemaTypes } from 'mongoose';
import { Employee } from '../employee/employee.schema';

@Schema({ timestamps: true })
export class Participants implements IParticipants {
  @Prop({
    type: SchemaTypes.ObjectId,
    ref: Employee.name,
  })
  candidate: IEmployeePayload;

  @Prop({ trim: true })
  howDidGetThisJob: string;

  createdAt: string;

  updatedAt: string;
}

export const ParticipantsSchema = SchemaFactory.createForClass(Participants);
