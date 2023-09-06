import { InternshipModel, LevelRequiredForJob } from '@shared/enums';
import { IBenefit } from './benefit.interface';
import { IEmployerPayload } from './employer.interface';
import { IJobStep, IJobStepCandidate } from './job-step.interface';
import { IImage } from './image.interface';
import {
  IJobToolUpdate,
  IJobToolCreate,
  IJobTool,
  IJobToolPayload,
} from './job-tool.interface';
import { State } from 'joi';
import {
  IJobLanguage,
  IJobLanguageCreate,
  IJobLanguagePayload,
  IJobLanguageUpdate,
} from './job-language.interface';

import {
  IJobCourseUpdate,
  IJobCourseCreate,
  IJobCourse,
  IJobCoursePayload,
} from './job-course.interface';
export interface IJob {
  _id: string;
  area: string;
  jobDescription: string;
  title?: string;
  minRequirements?: string;
  internshipValue?: number;
  quantity?: number;
  canSendCandidatesInPostgraduate?: boolean;
  acceptCandidatesFromOtherStates?: boolean;
  employer: IEmployerPayload;
  jobModel?: InternshipModel[];
  internshipAddress?: string;
  newCandidates?: IJobStepCandidate[];
  closed?: boolean;
  closedAt?: string;
  benefits?: IBenefit[];
  finishAt?: Date;
  steps?: IJobStep[];
  favoriteCandidates?: string[];
  jobImage?: IImage;
  tools?: IJobTool[];
  state?: State;
  city?: string;
  jobRequiredLevel?: LevelRequiredForJob;
  companyProvideTechnologicalResources?: boolean;
  graduationForJob?: IJobCourse[];
  periodCursingForJob?: number;
  languages?: IJobLanguage[];
  responsibleName: string;
  responsibleEmail: string;
  idealCourseCompletion: string;
  externalJobId?: number;
}

export interface IJobCreate
  extends Omit<
    IJob,
    | 'benefits'
    | 'employer'
    | 'steps'
    | 'favoriteCandidates'
    | 'tools'
    | 'languages'
    | 'graduationForJob'
  > {
  employer: string;
  benefits?: string[];
  steps?: string[];
  tools?: IJobToolCreate[];
  languages?: IJobLanguageCreate[];
  graduationForJob?: IJobCourseCreate[];
}
export interface IJobUpdate
  extends Omit<
    IJob,
    | 'benefits'
    | 'employer'
    | 'steps'
    | 'favoriteCandidates'
    | 'tools'
    | 'languages'
    | 'graduationForJob'
  > {
  _id: string;
  area: string;
  jobDescription: string;
  title?: string;
  minRequirements?: string;
  internshipValue?: number;
  quantity?: number;
  canSendCandidatesInPostgraduate?: boolean;
  acceptCandidatesFromOtherStates?: boolean;
  employer: IEmployerPayload;
  jobModel?: InternshipModel[];
  internshipAddress?: string;
  newCandidates?: IJobStepCandidate[];
  closed?: boolean;
  closedAt?: string;
  benefits?: IBenefit[];
  finishAt?: Date;
  steps?: IJobStep[];
  favoriteCandidates?: string[];
  jobImage?: IImage;
  tools?: IJobToolUpdate[];
  state?: State;
  city?: string;
  jobRequiredLevel?: LevelRequiredForJob;
  companyProvideTechnologicalResources?: boolean;
  graduationForJob?: IJobCourseUpdate[];
  periodCursingForJob?: number;
  languages?: IJobLanguageUpdate[];
  responsibleName: string;
  responsibleEmail: string;
  idealCourseCompletion: string;
}

export interface IJobPayload
  extends Omit<IJob, 'languages' | 'tools' | 'graduationForJob'> {
  _id: string;
  tools?: IJobToolPayload[];
  languages?: IJobLanguagePayload[];
  graduationForJob?: IJobCoursePayload[];
}
