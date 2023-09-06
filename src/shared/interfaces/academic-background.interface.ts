import { University } from '@schemas';
import {
  AcademicBackgroundStatus,
  AcademicBackgroundType,
  AcademicShift,
  Studentship,
  WhereStudiedHighSchool,
} from '@shared/enums';

export interface IAcademicBackground {
  university: University;
  course: string;
  period: number;
  shift: AcademicShift;
  status: AcademicBackgroundStatus;
  type?: AcademicBackgroundType;
  finishedAt?: string;
  availableToChangeShift?: boolean;
  isPartOfJuniorEmploye?: boolean;
  juniorEmployer?: string;
  whereStudiedHighSchool: WhereStudiedHighSchool;
  scholarship: Studentship;
  scholarshipPercentage: number;
}

export interface IAcademicBackgroundUpdate
  extends Partial<Omit<IAcademicBackground, 'university'>> {
  _id: string;
  university?: string;
}

export interface IAcademicBackgroundCreate
  extends Omit<IAcademicBackground, 'university'> {
  university?: string;
}

export interface IAcademicBackgroundPayload extends IAcademicBackground {
  _id: string;
}
