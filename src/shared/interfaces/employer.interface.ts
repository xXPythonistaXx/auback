import { Address, User } from '@schemas';
import { IAddressPayload } from './address.interface';
import { IBenefit } from './benefit.interface';
import { IEmployeePayload } from './employee.interface';
import { IImage } from './image.interface';
import { IJob } from './job.interface';
import { ISegment, ISegmentPayload } from './segment.interface';

export interface IEmployer {
  cnpj: string;
  businessName?: string; // Nome fantasia
  corporateName: string; // Razão social
  profile?: IEmployerProfile;
  profileImage?: IImage;
  staffPicture?: IImage;
  active?: boolean;
  addresses?: Address[];
  humanResources?: IEmployerHumanResources;
  jobs?: IJob[];
  user: User;
  favoriteCandidates?: IEmployeePayload[];
  slug?: string;
}

export interface IEmployerProfile {
  companyDescription?: string;
  companyPurpose?: string;
  companyValues?: string;
  cuturalCharacteristcs?: string;
  websiteUrl?: string;
  socialUrl?: string;
  segment?: ISegment;
  benefits?: IBenefit[];
}

export interface IEmployerHumanResources {
  legalRepresentant?: string;
  legalRepresentantEmail?: string;
  legalRepresentantJobTitle?: string;
  internshipResponsible?: string;
  internshipResponsibleEmail?: string;
  contractResponsible?: string;
  contractResponsibleEmail?: string;
  isSameInternshipSponsorValue?: boolean;
  willProvideEquipamentForIntern?: boolean;
}

export interface IEmployerProfileUpdate
  extends Partial<Omit<IEmployerProfile, 'segment' | 'benefits'>> {
  segment?: string;
  benefits?: string[];
}

export interface IEmployerUpdate
  extends Partial<
    Omit<
      IEmployer,
      'user' | 'addresses' | 'profile' | 'jobs' | 'favoriteCandidates'
    >
  > {
  addresses?: string;
  profile?: IEmployerProfileUpdate;
  favoriteCandidates?: string[];
}

export interface IEmployerPayload
  extends Omit<IEmployer, 'addresses' | 'segment'> {
  _id: string;
  addresses?: IAddressPayload[];
  segment?: ISegmentPayload;
}

export interface IEmployerDashboard {
  totalJobs: number;
  totalNewCandidates: number;
  totalFavorite: number;
  jobInProgressTotal: number;
  jobOccupationsQuantityOpen: number;
  jobOccupationsQuantityFinished: number;
  lastDaysCandidates: {
    total: number;
    data: {
      name: string;
      value: number;
      date: string;
    }[];
  };
}
