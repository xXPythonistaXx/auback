export interface IPdf {
  _id?: string;
  key?: string;
  location: string;
}

export interface IPdfUpdate extends Partial<IPdf> {}
