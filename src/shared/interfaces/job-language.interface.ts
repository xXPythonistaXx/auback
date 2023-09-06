import { Language } from '@schemas';
import { LanguageLevel } from '@shared/enums';
import { ILanguagePayload } from './language.interface';

export interface IJobLanguage {
  language: Language;
  speaking?: LanguageLevel;
  writing?: LanguageLevel;
  reading?: LanguageLevel;
}

export interface IJobLanguageUpdate
  extends Partial<Omit<IJobLanguage, 'language'>> {
  _id: string;
  language: string;
}

export interface IJobLanguageCreate
  extends Partial<Omit<IJobLanguage, 'language'>> {
  language: string;
}

export interface IJobLanguagePayload extends Omit<IJobLanguage, 'language'> {
  _id: string;
  language: ILanguagePayload;
}
