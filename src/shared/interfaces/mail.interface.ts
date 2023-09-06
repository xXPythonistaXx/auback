export interface SendCandidateMessageParams {
  email: string;
  message?: string;
  from?: string;
  subject?: string;
  custom?: boolean;
  firstName?: string;
  stepName?: string;
  jobTitle?: string;
}
