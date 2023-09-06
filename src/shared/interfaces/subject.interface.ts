export interface ISubject {
  name: string;
}

export type ISubjectUpdate = Partial<ISubject>;
export type ISubjectCreate = ISubject;

export interface ISubjectPayload extends ISubject {
  _id: string;
}
