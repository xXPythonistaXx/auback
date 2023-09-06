import { JobStepCandidateStatus } from '@shared/enums';
import { IEmployeePayload } from './employee.interface';
import { PsTestResult } from 'src/schemas/ps-test-result.schema';

export interface IJobStep {
  _id: string;
  name: string;
  job?: string;
  order?: number;
  approvedMessage?: string;
  reprovedMessage?: string;
  lastStep?: boolean;
  closed?: boolean;
  closedAt?: string;
  candidates?: IJobStepCandidate[];
}

export interface IJobStepCandidate {
  _id: string;
  createdAt: string;
  updatedAt: string;
  howDidGetThisJob: string;
  status?: JobStepCandidateStatus;
  receivedCustomFeedback?: boolean;
  customFeedbackFrom?: string;
  customFeedbackTitle?: string;
  customFeedback?: string;
  reprovedStep?: IJobStepCandidateReprovedStep;
  candidate: IEmployeePayload;
  step?: string;
  psTestUrl?: string | null;
  psTestResults?: PsTestResult;
}

export interface IParticipants {
  candidate: IEmployeePayload;
  howDidGetThisJob: string;
  createdAt: string;
  updatedAt: string;
}

export interface IJobStepCandidateReprovedStep
  extends Pick<IJobStep, '_id' | 'name' | 'order'> {}

export interface IJobStepCreate extends Omit<IJobStep, 'candidates'> {
  candidates?: string[];
}

export interface IJobStepUpdate extends Partial<Omit<IJobStep, 'candidates'>> {
  _id?: string;
  candidates?: string[];
}

export interface IJobStepPayload extends IJobStep {
  _id: string;
}

export interface IJobStepCandidateCreate
  extends Omit<IJobStepCandidate, 'candidate'> {
  candidate: string;
}

export interface IJobStepCandidateUpdate
  extends Partial<Omit<IJobStepCandidate, 'candidate'>> {
  _id?: string;
  candidate?: string;
}

export interface IJobStepCandidatesUpdate {
  customFeedback?: string;
  customFeedbackTitle?: string;
  customFeedbackFrom?: string;
  candidates?: string[];
}
