import {
  AcademicBackground,
  Certificate,
  Experience,
  State,
  User,
} from '@schemas';
import {
  AvailabilityForChange,
  FamilyIncome,
  Gender,
  HumanRace,
  InternshipModel,
  LivingPlace,
  Pcd,
  SexualOrientation,
  Studentship,
  WhereStudiedHighSchool,
} from '@shared/enums';
import { IAcademicBackgroundUpdate } from './academic-background.interface';
import {
  IEmployeeLanguage,
  IEmployeeLanguagePayload,
  IEmployeeLanguageUpdate,
} from './employee-language.interface';
import {
  IEmployeeTool,
  IEmployeeToolPayload,
  IEmployeeToolUpdate,
} from './employee-tool.interface';
import { IImage } from './image.interface';
import { IJob } from './job.interface';

export interface IEmployee {
  cpf?: string;
  firstName: string;
  lastName: string;
  active?: boolean;
  profileImage?: IImage;
  pdf?: IImage;
  isAvailableForChange?: AvailabilityForChange;
  isUniversityStudent?: boolean;
  linkedinUrl?: string;
  instagramUrl?: string;
  portfolioUrl?: string;
  city?: string;
  phoneNumber?: string;
  lastJobTitle?: string;
  salaryExpectation?: number;
  user: User;
  state?: State;
  about?: IAboutEmployee;
  academicBackgrounds?: AcademicBackground[];
  experiences?: Experience[];
  languages?: IEmployeeLanguage[];
  tools?: IEmployeeTool[];
  certificates?: Certificate[];
  favoriteJobs?: IJob[];
  employersFavorite?: string[];
  learnWorldsUserId?: string;
  learnWorldsUserCourseCompleted?: boolean;
  birthDate?: Date;
  gender?: Gender;
  postalCode?: string;
  neighborhood?: string;
  externalId?: number;
}

export type IAboutEmployee = {
  resume?: string;
  videoUrl?: string;
  internshipModel?: InternshipModel[];
  humanRace?: HumanRace;
  sexualOrientation?: SexualOrientation;
  pcd?: Pcd;
  livingPlace?: LivingPlace;
  whereStudiedHighSchool?: WhereStudiedHighSchool;
  familyIncome?: FamilyIncome;
  studentship?: Studentship;
};

export interface IEmployeeUpdate
  extends Partial<
    Omit<
      IEmployee,
      | 'user'
      | 'state'
      | 'academicBackgrounds'
      | 'languages'
      | 'tools'
      | 'favoriteJobs'
    >
  > {
  state?: string;
  academicBackgrounds?: IAcademicBackgroundUpdate[];
  languages?: IEmployeeLanguageUpdate[];
  tools?: IEmployeeToolUpdate[];
  favoriteJobs?: string[];
  learnWorldsUserId?: string;
  learnWorldsUserCourseCompleted?: boolean;
}

export interface IEmployeePayload
  extends Omit<IEmployee, 'languages' | 'tools'> {
  _id: string;
  languages?: IEmployeeLanguagePayload[];
  tools?: IEmployeeToolPayload[];
}

export interface IEmployeeDashboard {
  totalJobs: number;
  totalNewJobs: number;
  totalFavorited: number;
  inProggressTotal: number;
  lastDaysCandidates: {
    total: number;
    data: {
      name: string;
      value: number;
      date: string;
    }[];
  };
}
