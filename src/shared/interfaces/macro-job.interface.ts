import { IJob } from './job.interface';

export interface IMacroJob {
  _id: string;
  title: string;
  description: string;
  endAt: Date;
  closedAt: string;
  slug?: string;
  jobs?: IJob[];
  hasJobs: boolean;
  keyIcon?: string;
  backgroundkeyIcon?: string;
  responsable?: string;
}
export interface IMacroJobPayload extends IMacroJob {
  _id: string;
}

export type IMacroJobUpdate = Partial<IMacroJob>;
export type IMacroJobCreate = IMacroJob;
