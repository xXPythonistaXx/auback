export interface IImage {
  _id?: string;
  key?: string;
  location: string;
}

export interface IImageUpdate extends Partial<IImage> {}
