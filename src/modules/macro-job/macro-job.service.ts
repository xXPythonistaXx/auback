import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import mongoose, { Model } from 'mongoose';
import { MacroJobCreateDTO } from './dto/macro-job-create.dto';
import { MacroJobUpdateDTO } from './dto/macro-job-update.dto';
import {} from 'src/schemas/macro-job/macro-job.schema';
import { Job, JobDocument, MacroJob, MacroJobDocument } from '@schemas';
import { AggregatePaginateModel } from '@shared/interfaces';
import { EmployerService } from '@modules/employer/employer.service';

@Injectable()
export class MacroJobService {
  constructor(
    @InjectModel(MacroJob.name) private macroJobModel: Model<MacroJobDocument>,
    @InjectModel(Job.name)
    private jobModel: AggregatePaginateModel<JobDocument>,
    private employerService: EmployerService,
  ) {}

  async create(
    createMacroJobDto: MacroJobCreateDTO,
    userId: string,
  ): Promise<MacroJob> {
    const employer = await this.employerService.findByUserId(userId);
    const slug = createMacroJobDto.description
      .replace(/\s+/g, '-')
      .toLowerCase();
    if (!createMacroJobDto.slug) {
      createMacroJobDto.slug = slug;
    }
    createMacroJobDto.responsable = `${employer.businessName}`;
    const createdMacroJob = new this.macroJobModel(createMacroJobDto);
    return createdMacroJob.save();
  }

  async findAll(): Promise<MacroJob[]> {
    return this.macroJobModel
      .find()
      .populate({
        path: 'jobs',
        model: 'Job',
        select: [
          '-steps',
          '-favoriteCandidates',
          '-newCandidates',
          '-participants',
        ],
      })
      .exec();
  }

  async findOne(id: string): Promise<MacroJob> {
    const macroJob = await this.macroJobModel
      .findOne({
        slug: id,
      })
      .populate([
        {
          path: 'jobs',
          model: 'Job',
          select: ['-steps', '-favoriteCandidates', '-newCandidates'],
        },
      ])
      .exec();
    if (!macroJob) {
      throw new NotFoundException(`MacroJob with id ${id} not found`);
    }
    return macroJob;
  }

  async update(
    id: string,
    updateMacroJobDto: MacroJobUpdateDTO,
  ): Promise<MacroJob> {
    const updatedMacroJob = await this.macroJobModel
      .findOneAndUpdate({ slug: id }, updateMacroJobDto, { new: true })
      .exec();
    if (!updatedMacroJob) {
      throw new NotFoundException(`MacroJob with id ${id} not found`);
    }
    return updatedMacroJob;
  }

  async remove(id: string): Promise<void> {
    const deletedMacroJob = await this.macroJobModel
      .findByIdAndRemove(id)
      .exec();
    if (!deletedMacroJob) {
      throw new NotFoundException(`MacroJob with id ${id} not found`);
    }
  }

  async addJobsToMacroJob(
    id: string,
    jobIds: string | string[],
  ): Promise<MacroJob> {
    try {
      const macroJob = await this.macroJobModel.findById(id).exec();
      if (!macroJob) {
        throw new NotFoundException(`MacroJob with id ${id} not found`);
      }

      const objectJobIds = Array.isArray(jobIds)
        ? jobIds.map((jobId) => {
            if (mongoose.Types.ObjectId.isValid(jobId)) {
              return jobId;
            } else {
              throw new BadRequestException(`Invalid job ID: ${jobId}`);
            }
          })
        : jobIds;

      const jobsToAdd = await this.jobModel
        .find({ _id: { $in: objectJobIds } })
        .exec();

      macroJob.jobs.push(...jobsToAdd);
      return await macroJob.save();
    } catch (error) {
      throw error;
    }
  }

  async removeJobsFromMacroJob(
    id: string,
    jobIds: string | string[],
  ): Promise<MacroJob> {
    try {
      const macroJob = await this.macroJobModel.findById(id).exec();
      if (!macroJob) {
        throw new NotFoundException(`MacroJob with id ${id} not found`);
      }

      const objectJobIds = Array.isArray(jobIds)
        ? jobIds.map((jobId) => {
            if (mongoose.Types.ObjectId.isValid(jobId)) {
              return jobId;
            } else {
              throw new BadRequestException(`Invalid job ID: ${jobId}`);
            }
          })
        : jobIds;

      const updatedJobsArray = macroJob.jobs.filter(
        (job) => !objectJobIds.includes(job.toString()),
      );
      macroJob.jobs = updatedJobsArray;

      return await macroJob.save();
    } catch (error) {
      throw error;
    }
  }
}
