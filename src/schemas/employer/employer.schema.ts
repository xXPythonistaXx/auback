import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import {
  IEmployer,
  IEmployerHumanResources,
  IEmployerProfile,
  IJob,
} from '@shared/interfaces';
import { Document, SchemaTypes } from 'mongoose';
import { Address, AddressSchema } from '../address.schema';
import { Employee } from '../employee/employee.schema';
import { Image, ImageSchema } from '../image.schema';
import { Job } from '../job/job.schema';
import { User } from '../user.schema';
import { EmployerHumanResourcesSchema } from './employer-human-resources.schema';
import { EmployerProfileSchema } from './employer-profile.schema';
import slugify from 'slugify';

export type EmployerDocument = Employer & Document;

@Schema({ timestamps: true })
export class Employer implements IEmployer {
  _id: string;

  @Prop({ unique: true, trim: true })
  cnpj: string;

  @Prop({ trim: true })
  businessName?: string;

  @Prop({ trim: true })
  corporateName: string;

  @Prop({
    type: ImageSchema,
    autopopulate: true,
  })
  profileImage?: Image;

  @Prop({
    type: ImageSchema,
    autopopulate: true,
  })
  staffPicture?: Image;

  @Prop({ default: false })
  active?: boolean;

  @Prop({
    type: EmployerProfileSchema,
    autopopulate: true,
  })
  profile?: IEmployerProfile;

  @Prop({
    type: EmployerHumanResourcesSchema,
    autopopulate: true,
  })
  humanResources?: IEmployerHumanResources;

  @Prop({
    type: [
      {
        type: AddressSchema,
        autopopulate: true,
      },
    ],
  })
  addresses?: Address[];

  @Prop({
    type: [
      {
        type: SchemaTypes.ObjectId,
        ref: Job.name,
      },
    ],
  })
  jobs?: IJob[];

  @Prop({ type: SchemaTypes.ObjectId, ref: 'User', autopopulate: true })
  user: User;

  @Prop({
    type: [{ type: SchemaTypes.ObjectId, ref: 'Employee' }],
  })
  favoriteCandidates?: Employee[];

  @Prop({ unique: true, trim: true })
  slug: string;

  preSaveHook() {
    if (this.businessName) {
      this.slug = slugify(this.businessName, {
        lower: true,
      });
    }
  }
}

export const EmployerSchema = SchemaFactory.createForClass(Employer);

EmployerSchema.pre('save', function (next) {
  if (this.businessName) {
    this.slug = slugify(this.businessName, {
      lower: true,
    });
  }
  next();
});
