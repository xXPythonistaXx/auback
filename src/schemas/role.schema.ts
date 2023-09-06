import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { IRole } from '@shared/interfaces';
import { Document, SchemaTypes } from 'mongoose';
import { Permission } from './permission.schema';

export type RoleDocument = Role & Document;

@Schema({ timestamps: true })
export class Role implements IRole {
  _id: string;

  @Prop({ unique: true, trim: true, lowercase: true })
  name: string;

  @Prop({
    type: [
      { type: SchemaTypes.ObjectId, ref: 'Permission', autopopulate: true },
    ],
    autopopulate: true,
  })
  permissions?: Permission[];
}

export const RoleSchema = SchemaFactory.createForClass(Role);
