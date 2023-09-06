import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { IUser } from '@shared/interfaces';
import { Document, SchemaTypes } from 'mongoose';
import { Role } from './role.schema';

export type UserDocument = User & Document;

@Schema({ timestamps: true })
export class User implements IUser {
  _id: string;

  @Prop({ unique: true, trim: true, lowercase: true })
  email: string;

  @Prop({ default: false })
  emailConfirmed?: boolean;

  @Prop()
  emailConfirmationCode?: string;

  @Prop()
  emailConfirmationExpiration?: string;

  @Prop()
  password?: string;

  @Prop()
  googleId?: string;

  @Prop()
  facebookId?: string;

  @Prop()
  resetPasswordCode?: string;

  @Prop()
  resetPasswordExpiration?: string;

  @Prop({ type: SchemaTypes.ObjectId, ref: 'Role', autopopulate: true })
  role: Role;
}

export const UserSchema = SchemaFactory.createForClass(User);
