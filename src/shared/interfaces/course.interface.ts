export interface ICourse {
  name: string;
  tipoCurso: string;
}

export interface ICoursePayload extends ICourse {
  _id: string;
}

export type ICourseUpdate = Partial<ICourse>;
export type ICourseCreate = ICourse;
