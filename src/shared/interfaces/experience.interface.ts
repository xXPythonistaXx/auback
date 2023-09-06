export interface IExperience {
  employer: string;
  jobTitle: string;
  startedAt: string;
  finishedAt?: string;
  activities: string;
}

export interface IExperienceUpdate extends Partial<IExperience> {
  _id: string;
}

export type IExperienceCreate = Partial<IExperience>;

export interface IExperiencePayload extends IExperience {
  _id: string;
}
