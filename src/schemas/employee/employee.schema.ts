import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { AvailabilityForChange, Gender } from '@shared/enums';
import { IEmployee, IJob, IPdf } from '@shared/interfaces';
import { Document, SchemaTypes } from 'mongoose';
import { AboutEmployee, AboutEmployeeSchema } from './about-employee.schema';
import {
  AcademicBackground,
  AcademicBackgroundSchema,
} from '../academic-background.schema';
import { Certificate, CertificateSchema } from '../certificate.schema';
import {
  EmployeeLanguage,
  EmployeeLanguageSchema,
} from './employee-language.schema';
import { EmployeeTool, EmployeeToolSchema } from './employee-tool.schema';
import { Experience, ExperienceSchema } from '../experience.schema';
import { State } from '../state.schema';
import { User } from '../user.schema';
import { Image, ImageSchema } from '../image.schema';
import { IPdfSchema } from '../pdf.schema';

export type EmployeeDocument = Employee & Document;

@Schema({
  timestamps: true,
  toJSON: {
    virtuals: true,
  },
  toObject: {
    virtuals: true,
  },
})
export class Employee implements IEmployee {
  _id: string;

  @Prop({ unique: true, sparse: true, trim: true })
  cpf: string;

  @Prop({ trim: true })
  firstName: string;

  @Prop({ trim: true })
  lastName: string;

  fullName: string;

  @Prop({
    type: ImageSchema,
    autopopulate: true,
  })
  profileImage?: Image;

  @Prop({
    type: IPdfSchema,
    autopopulate: true,
  })
  pdf?: IPdf;

  @Prop({ default: true })
  active?: boolean;

  @Prop()
  isAvailableForChange?: AvailabilityForChange;

  @Prop()
  isUniversityStudent?: boolean;

  @Prop()
  city?: string;

  lastJobTitle?: string;

  @Prop()
  linkedinUrl?: string;

  @Prop()
  instagramUrl?: string;

  @Prop()
  portfolioUrl?: string;

  @Prop()
  phoneNumber?: string;

  @Prop()
  salaryExpectation?: number;

  @Prop({
    type: SchemaTypes.ObjectId,
    ref: 'User',
    autopopulate: false,
  })
  user: User;

  @Prop({ type: SchemaTypes.ObjectId, ref: 'State', autopopulate: true })
  state?: State;

  @Prop({ type: AboutEmployeeSchema, autopopulate: true })
  about: AboutEmployee;

  @Prop({
    type: [
      {
        type: AcademicBackgroundSchema,
        autopopulate: true,
      },
    ],
  })
  academicBackgrounds: AcademicBackground[];

  @Prop({
    type: [
      {
        type: ExperienceSchema,
        autopopulate: true,
      },
    ],
  })
  experiences?: Experience[];

  @Prop({
    type: [{ type: EmployeeToolSchema, autopopulate: true }],
  })
  tools?: EmployeeTool[];

  @Prop({
    type: [
      {
        type: EmployeeLanguageSchema,
        autopopulate: true,
      },
    ],
  })
  languages?: EmployeeLanguage[];

  @Prop({
    type: [
      {
        type: CertificateSchema,
        autopopulate: true,
      },
    ],
  })
  certificates?: Certificate[];

  @Prop({
    type: [{ type: SchemaTypes.ObjectId, ref: 'Job' }],
  })
  favoriteJobs?: IJob[];

  @Prop({
    type: [{ type: SchemaTypes.ObjectId, ref: 'Employer' }],
  })
  employersFavorite?: string[];

  @Prop({
    type: String,
    default: null,
  })
  learnWorldsUserId?: string;

  @Prop({
    type: Boolean,
    default: false,
  })
  learnWorldsUserCourseCompleted?: boolean;

  @Prop({ type: Date })
  birthDate?: Date;

  @Prop()
  gender?: Gender;

  @Prop({ trim: true })
  postalCode?: string;

  @Prop({ trim: true })
  neighborhood?: string;

  @Prop({ unique: true, sparse: true, trim: true })
  externalId?: number;
}

export const EmployeeSchema = SchemaFactory.createForClass(Employee);

EmployeeSchema.virtual('lastJobTitle').get(function (this: EmployeeDocument) {
  const lastXp = this.experiences?.find((xp) => xp.startedAt && !xp.finishedAt);
  if (lastXp) return lastXp.jobTitle;
});

EmployeeSchema.virtual('fullName').get(function (this: EmployeeDocument) {
  return `${this.firstName} ${this.lastName}`;
});
