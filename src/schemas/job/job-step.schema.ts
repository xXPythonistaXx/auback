import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { IJobStep, IJobStepCandidate } from '@shared/interfaces';
import { Document, SchemaTypes } from 'mongoose';
import {
  JobStepCandidate,
  JobStepCandidateSchema,
} from './job-step-candidate.schema';

export type JobStepDocument = JobStep & Document;

@Schema()
export class JobStep implements IJobStep {
  _id: string;

  @Prop({ trim: true })
  name: string;

  @Prop()
  order?: number;

  @Prop({ trim: true })
  approvedMessage?: string;

  @Prop({ trim: true })
  reprovedMessage?: string;

  @Prop({ default: false })
  lastStep?: boolean;

  @Prop({ default: false })
  closed?: boolean;

  @Prop()
  closedAt?: string;

  @Prop({
    type: SchemaTypes.ObjectId,
    ref: 'Job',
  })
  job: string;

  @Prop({
    type: [
      {
        type: JobStepCandidateSchema,
        ref: JobStepCandidate.name,
      },
    ],
  })
  candidates?: IJobStepCandidate[];

  @Prop({ default: false })
  defaultStep?: boolean;
}

const JobStepSchema = SchemaFactory.createForClass(JobStep);

export { JobStepSchema };
