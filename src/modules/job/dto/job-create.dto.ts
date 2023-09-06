import { InternshipModel, LevelRequiredForJob } from '@shared/enums';
import {
  IImage,
  IJobCourseCreate,
  IJobCreate,
  IJobLanguageCreate,
} from '@shared/interfaces';
import { IJobToolCreate } from '@shared/interfaces/job-tool.interface';
import { Transform } from 'class-transformer';
import {
  IsBoolean,
  IsDateString,
  IsNotEmpty,
  IsOptional,
  ValidateIf,
} from 'class-validator';
import { State } from 'joi';
import * as moment from 'moment-timezone';

export class JobCreateDTO implements IJobCreate {
  _id: string;

  @IsOptional()
  benefits?: string[];

  @IsNotEmpty({ message: 'A área de atuação é obrigatória.' })
  area: string;

  @IsOptional()
  jobDescription: string;

  @IsNotEmpty({ message: 'O título da vaga é obrigatório.' })
  title: string;

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
  employer: string;

  @IsOptional()
  jobModel?: InternshipModel[];

  @IsOptional()
  internshipAddress?: string;

  @IsBoolean({ message: 'A propriedade closed precisa ser boolean.' })
  @IsOptional()
  closed?: boolean;

  @ValidateIf((value) => value.finishAt !== '')
  @Transform(({ value }) =>
    moment.tz(value, 'YYYY-MM-DD', 'America/Sao_Paulo').endOf('day'),
  )
  @IsOptional()
  finishAt?: Date;

  @IsDateString()
  @ValidateIf((value) => value.finishAt !== '')
  @IsOptional()
  closedAt?: string;

  @Transform(({ value }) => {
    return Buffer.from(value as string, 'base64');
  })
  jobImage: IImage;

  @IsOptional()
  tools?: IJobToolCreate[];

  @IsOptional()
  state?: State;

  @IsOptional()
  city?: string;

  @IsOptional()
  jobRequiredLevel?: LevelRequiredForJob;

  @IsOptional()
  companyProvideTechnologicalResources?: boolean;

  @IsOptional()
  graduationForJob?: IJobCourseCreate[];

  @IsOptional()
  periodCursingForJob?: number;

  @IsOptional()
  languages?: IJobLanguageCreate[];

  @IsOptional()
  responsibleName: string;

  @IsOptional()
  responsibleEmail: string;

  @IsOptional()
  idealCourseCompletion: string;

  @IsOptional()
  externalJobId: number;
}
