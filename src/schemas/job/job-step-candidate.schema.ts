import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { JobStepCandidateStatus } from '@shared/enums';
import {
  IEmployeePayload,
  IJobStepCandidate,
  IJobStepCandidateReprovedStep,
} from '@shared/interfaces';
import { Document, SchemaTypes } from 'mongoose';
import { Employee } from '../employee/employee.schema';
import { PsTestResult, PsTestResultSchema } from '../ps-test-result.schema';
import { IPsTestResult } from '@shared/interfaces/psTestResult.interface';

export type JobStepCandidateDocument = JobStepCandidate & Document;

@Schema({ timestamps: true })
export class JobStepCandidate implements IJobStepCandidate {
  _id: string;

  createdAt: string;

  updatedAt: string;

  @Prop({ trim: true })
  howDidGetThisJob: string;

  @Prop({ trim: true })
  status?: JobStepCandidateStatus;

  @Prop({ trim: true })
  customFeedbackFrom?: string;

  @Prop({ trim: true })
  customFeedbackTitle?: string;

  @Prop({ trim: true })
  customFeedback?: string;

  @Prop({ default: false })
  receivedCustomFeedback?: boolean;

  @Prop({
    type: SchemaTypes.ObjectId,
    ref: 'JobStep',
  })
  step?: string;

  @Prop({
    type: SchemaTypes.ObjectId,
    ref: 'JobStep',
  })
  reprovedStep?: IJobStepCandidateReprovedStep;

  @Prop({
    type: SchemaTypes.ObjectId,
    ref: Employee.name,
  })
  candidate: IEmployeePayload;

  @Prop({ type: String, default: null })
  psTestUrl?: string | null;

  @Prop({
    type: PsTestResultSchema,
    ref: PsTestResult.name,
  })
  psTestResults?: IPsTestResult;
}

export const JobStepCandidateSchema =
  SchemaFactory.createForClass(JobStepCandidate);
