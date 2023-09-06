import { InternshipModel, LevelRequiredForJob } from '@shared/enums';
import {
  IBenefit,
  IEmployerPayload,
  IJobCourseUpdate,
  IJobLanguageUpdate,
  IJobStep,
  IJobUpdate,
} from '@shared/interfaces';
import { IJobToolUpdate } from '@shared/interfaces/job-tool.interface';
import { Transform } from 'class-transformer';
import {
  IsBoolean,
  IsDateString,
  IsOptional,
  ValidateIf,
} from 'class-validator';
import { State } from 'joi';

export class JobUpdateDTO implements IJobUpdate {
  @IsOptional()
  employer: IEmployerPayload;

  @IsOptional()
  steps?: IJobStep[];

  @IsOptional()
  _id: string;

  @IsOptional()
  benefits?: IBenefit[];

  @IsOptional()
  area: string;

  @IsOptional()
  jobDescription: string;

  @IsOptional()
  title?: string;

  @IsOptional()
  minRequirements?: string;

  @IsOptional()
  internshipValue?: number;

  @IsOptional()
  quantity?: number;

  @IsOptional()
  canSendCandidatesInPostgraduate?: boolean;

  @IsOptional()
  acceptCandidatesFromOtherStates?: boolean;

  @IsOptional()
  jobModel?: InternshipModel[];

  @IsOptional()
  internshipAddress?: string;

  @IsBoolean({ message: 'A propriedade closed precisa ser boolean.' })
  @IsOptional()
  closed?: boolean;

  @ValidateIf((value) => value.finishAt !== '')
  @Transform(({ value }) => new Date(value))
  @IsOptional()
  finishAt?: Date;

  @IsDateString()
  @ValidateIf((value) => value.finishAt !== '')
  @IsOptional()
  closedAt?: string;

  @IsOptional()
  tools?: IJobToolUpdate[];

  @IsOptional()
  state?: State;

  @IsOptional()
  city?: string;

  @IsOptional()
  jobRequiredLevel?: LevelRequiredForJob;

  @IsOptional()
  companyProvideTechnologicalResources?: boolean;

  @IsOptional()
  graduationForJob?: IJobCourseUpdate[];

  @IsOptional()
  periodCursingForJob?: number;

  @IsOptional()
  languages?: IJobLanguageUpdate[];

  @IsOptional()
  responsibleName: string;

  @IsOptional()
  responsibleEmail: string;

  @IsOptional()
  idealCourseCompletion: string;

  @IsOptional()
  externalJobId: number;
}
