import { DefaultJobStepsMock } from 'src/mocks/jobsteps';
import { addDefaultStepsOnJobCreated } from './add-default-steps-on-job.helper';

describe('addDefaultStepsOnJobCreated', () => {
  describe(`add ${DefaultJobStepsMock.length} steps on valid jobId`, () => {
    const jobStepModelMock = {
      create: jest.fn(),
    } as any;
    const jobId = 'any_job_id';

    it(`should call create ${DefaultJobStepsMock.length}`, async () => {
      await addDefaultStepsOnJobCreated(jobStepModelMock, jobId);

      expect(jobStepModelMock.create).toBeCalledTimes(
        DefaultJobStepsMock.length,
      );

      DefaultJobStepsMock.forEach((step) => {
        expect(jobStepModelMock.create).toBeCalledWith({ ...step, job: jobId });
      });
    });
  });
});
