import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { InternshipModel, LevelRequiredForJob } from '@shared/enums';
import {
  IBenefit,
  IEmployerPayload,
  IJob,
  IJobStep,
  IJobStepCandidate,
  IParticipants,
} from '@shared/interfaces';
import { Document, SchemaTypes } from 'mongoose';
import { Benefit } from '../benefit.schema';
import {
  JobStepCandidate,
  JobStepCandidateSchema,
} from './job-step-candidate.schema';
import { JobStep } from './job-step.schema';
import { Image, ImageSchema } from '../image.schema';
import { JobTool, JobToolSchema } from './job-tool.schema';
import { State } from 'joi';
import { JobLanguageSchema, JobLanguage } from './job-language.schemas';
import { JobCourse, JobCourseSchema } from './job-course.schema';
import { Participants, ParticipantsSchema } from './participants.schema';

export type JobDocument = Job & Document;

@Schema({
  toJSON: {
    virtuals: true,
  },
  toObject: {
    virtuals: true,
  },
})
export class Job implements IJob {
  _id: string;

  @Prop({ trim: true })
  area: string;

  @Prop({ trim: true })
  jobDescription: string;

  @Prop({ trim: true })
  title: string;

  @Prop({ trim: true })
  minRequirements?: string;

  @Prop()
  internshipValue?: number;

  @Prop()
  quantity?: number;

  @Prop()
  canSendCandidatesInPostgraduate?: boolean;

  @Prop()
  acceptCandidatesFromOtherStates?: boolean;

  @Prop()
  jobModel?: InternshipModel[];

  @Prop({ trim: true })
  internshipAddress?: string;

  @Prop()
  finishAt?: Date;

  @Prop()
  closedAt?: string;

  @Prop({ default: false })
  closed?: boolean;

  hasSteps: boolean;

  @Prop({
    type: SchemaTypes.ObjectId,
    ref: 'Employer',
  })
  employer: IEmployerPayload;

  @Prop({
    type: [
      {
        type: SchemaTypes.ObjectId,
        ref: Benefit.name,
        autopopulate: true,
      },
    ],
  })
  benefits?: IBenefit[];

  @Prop({
    type: [
      {
        type: JobStepCandidateSchema,
        ref: JobStepCandidate.name,
      },
    ],
  })
  newCandidates?: IJobStepCandidate[];

  @Prop({
    type: [
      {
        type: ParticipantsSchema,
        ref: Participants.name,
      },
    ],
  })
  participants?: IParticipants;

  @Prop({
    type: [
      {
        type: SchemaTypes.ObjectId,
        ref: JobStep.name,
      },
    ],
  })
  steps: IJobStep[];

  @Prop({
    type: [
      {
        type: SchemaTypes.ObjectId,
        ref: 'Employee',
      },
    ],
  })
  favoriteCandidates?: string[];

  @Prop({
    type: ImageSchema,
    autopopulate: true,
  })
  jobImage: Image;

  @Prop({ type: SchemaTypes.ObjectId, ref: 'State', autopopulate: true })
  state?: State;

  @Prop()
  city?: string;

  @Prop()
  companyProvideTechnologicalResources?: boolean;

  @Prop()
  jobRequiredLevel?: LevelRequiredForJob;

  @Prop({
    type: [
      {
        type: JobCourseSchema,
        autopopulate: true,
      },
    ],
  })
  graduationForJob?: JobCourse[];

  @Prop()
  periodCursingForJob?: number;

  @Prop({
    type: [{ type: JobToolSchema, autopopulate: true }],
  })
  tools?: JobTool[];

  @Prop({
    type: [
      {
        type: JobLanguageSchema,
        autopopulate: true,
      },
    ],
  })
  languages?: JobLanguage[];

  @Prop()
  responsibleName: string;

  @Prop({ trim: true, lowercase: true })
  responsibleEmail: string;

  @Prop()
  idealCourseCompletion: string;

  @Prop()
  psTestId?: string;

  @Prop({ unique: true, sparse: true, trim: true })
  externalJobId?: number;
}

const JobSchema = SchemaFactory.createForClass(Job);

JobSchema.virtual('hasSteps').get(function (this: JobDocument) {
  return this.steps?.length > 0;
});

export { JobSchema };
