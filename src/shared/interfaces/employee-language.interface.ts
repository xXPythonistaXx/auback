import { Language } from '@schemas';
import { LanguageLevel } from '@shared/enums';
import { ILanguagePayload } from './language.interface';

export interface IEmployeeLanguage {
  language: Language;
  speaking?: LanguageLevel;
  writing?: LanguageLevel;
  reading?: LanguageLevel;
}

export interface IEmployeeLanguageUpdate
  extends Partial<Omit<IEmployeeLanguage, 'language'>> {
  _id: string;
  language: string;
}

export interface IEmployeeLanguageCreate
  extends Partial<Omit<IEmployeeLanguage, 'language'>> {
  language: string;
}

export interface IEmployeeLanguagePayload
  extends Omit<IEmployeeLanguage, 'language'> {
  _id: string;
  language: ILanguagePayload;
}
