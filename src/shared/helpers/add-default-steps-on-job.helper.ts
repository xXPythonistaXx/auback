import { JobStepDocument } from '@schemas';
import { PaginateModel } from 'mongoose';
import { DefaultJobStepsMock } from '../../mocks/jobsteps';

export const addDefaultStepsOnJobCreated = async (
  jobsteps: PaginateModel<JobStepDocument>,
  jobId: string,
) => {
  for (const step of DefaultJobStepsMock) {
    await jobsteps.create({
      ...step,
      job: jobId,
    });
  }
};
