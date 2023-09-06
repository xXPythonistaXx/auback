export interface ILanguage {
  name: string;
}

export interface ILanguageUpdate extends Partial<ILanguage> {
  _id: string;
}

export type ILanguageCreate = Partial<ILanguage>;

export interface ILanguagePayload extends ILanguage {
  _id: string;
}
