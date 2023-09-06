import { EmployeeService } from '@modules/employee/employee.service';
import { JobService } from '@modules/job/job.service';
import { PinoService } from '@modules/logger/pino.service';
import {
  Inject,
  Injectable,
  NotFoundException,
  forwardRef,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { InjectModel } from '@nestjs/mongoose';
import {
  JobStep,
  JobStepDocument,
  PsTestResult,
  PsTestResultDocument,
} from '@schemas';
import { IPsTestResult } from '@shared/interfaces/psTestResult.interface';
import axios from 'axios';
import { PaginateModel } from 'mongoose';

@Injectable()
export class PushStartService {
  baseApiUrl: string;

  constructor(
    @InjectModel(JobStep.name)
    private jobStepModel: PaginateModel<JobStepDocument>,
    @InjectModel(PsTestResult.name)
    private psTestResultModel: PaginateModel<PsTestResultDocument>,
    @Inject(forwardRef(() => EmployeeService))
    private readonly employeeService: EmployeeService,
    @Inject(forwardRef(() => JobService))
    private readonly jobService: JobService,
    private readonly configService: ConfigService,
    private readonly logger: PinoService,
  ) {
    this.baseApiUrl = this.configService.get('PUSH_START_API_CREATE_TESTS_URL');
  }

  async findByUserId(userId: number): Promise<IPsTestResult> {
    const psTestResult = await this.psTestResultModel.findOne({
      userId: userId,
    });

    return psTestResult;
  }

  async savePsTestUrlInfo(
    psTestUrl: string,
    status: string,
    userId: number,
    userTestId: number,
  ) {
    try {
      const psTestResult = await this.psTestResultModel.create({
        status,
        userId,
        userTestId,
        psTestUrl,
      });

      this.logger.log(`PUSH START - PsTestUrl info saved for user ${userId}`);
      return psTestResult;
    } catch (error) {
      this.logger.log(
        `PUSH START - Error saving PsTestUrl info: ${(error as Error).message}`,
      );
      throw error;
    }
  }

  async createTest(employeeId: string, testId?: string, jobId?: string) {
    const employee = await this.employeeService.findById(employeeId);
    const job = await this.jobService.findOne(jobId);

    if (!employee) {
      this.logger.error('PUSH START - employee not found', {
        employeeId,
      });
      throw new NotFoundException('Employee not found');
    }

    if (!job) {
      this.logger.error('PUSH START - job not found', {
        jobId,
      });

      throw new NotFoundException('Job not found');
    }
    const bodyData = {
      testId: parseInt(testId),
      userId: employee.externalId,
      userTestId: job.externalJobId,
      name: `${employee.firstName} ${employee.lastName}`,
      email: employee.user.email,
      reuseTest: true,
    };

    try {
      const pushStartCreateTestApi = axios.create({
        baseURL: this.baseApiUrl,
        headers: {
          Authorization: `Bearer ${this.configService.get<string>(
            'PUSH_START_TOKEN',
          )}`,
        },
      });

      const { data: pushStartTest } = await pushStartCreateTestApi.post(
        `${this.baseApiUrl}`,
        bodyData,
      );

      this.logger.log(
        `PUSH START - Test created to user ${String(employeeId)}`,
      );

      await this.savePsTestUrlInfo(
        pushStartTest.url,
        pushStartTest.status,
        employee.externalId,
        job.externalJobId,
      );

      return {
        redirectUrl: pushStartTest.url,
        status: pushStartTest.status,
      };
    } catch (error) {
      this.logger.error(
        'PUSH START - erro on create test',
        error.response.toString(),
      );
      throw error;
    }
  }

  async handlePushStartWebhook(data: any) {
    const { userId, userTestId } = data;
    const employee = await this.employeeService.findByExternalId(data.userId);
    interface CompetenceResult {
      competenceId: number;
      name: string;
      score: number;
    }

    const psTestResults = {
      status: data.status,
      userId: data.userId,
      userTestId: data.userTestId,
      startedAt: new Date(data.startedAt),
      finishedAt: new Date(data.finishedAt),
      retries: data.retries,
      results: data.results.map((result: CompetenceResult) => ({
        competenceId: result.competenceId,
        name: result.name,
        score: result.score,
      })),
    };

    try {
      await this.psTestResultModel
        .findOneAndUpdate(
          { userId, userTestId },
          { results: psTestResults.results, status: psTestResults.status },
          { new: false },
        )
        .exec();

      const updatedCandidates = await this.jobStepModel
        .updateMany(
          {
            'candidates.candidate': employee._id,
          },
          {
            $set: {
              'candidates.$.psTestResults': psTestResults,
            },
          },
        )
        .exec();

      if (updatedCandidates.matchedCount === 0) {
        throw new NotFoundException(
          'JobStepCandidate not found for provided userId',
        );
      }

      this.logger.log(`Updated JobStepCandidates for userId ${String(userId)}`);
    } catch (error) {
      this.logger.log(
        `PUSH START - Error updating JobStepCandidates: ${
          (error as Error).message
        }`,
      );
    }
  }
}
