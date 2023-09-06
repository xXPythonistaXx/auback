import { subject } from '@casl/ability';
import {
  Body,
  Controller,
  Delete,
  ForbiddenException,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Patch,
  Post,
  Query,
  Request,
} from '@nestjs/common';
import { Public } from '@shared/decorators';
import { DefaultRoles, DefaultSubjects, PermissionAction } from '@shared/enums';
import { NotFoundException } from '@shared/exceptions';
import { ITokenParsePayload } from '@shared/interfaces';
import { CaslAbilityFactory } from '../authorization/casl-ability.factory';
import { ApproveReproveCandidateDTO } from './dto/approve-repprove-candidate.dto';
import { ApproveReproveCandidatesDTO } from './dto/approve-repprove-candidates.dto';
import { JobApplyDTO } from './dto/job-apply.dto';
import { JobCreateDTO } from './dto/job-create.dto';
import { JobStepCreateDTO } from './dto/job-step-create.dto';
import { JobStepUpdateDTO } from './dto/job-step-update.dto';
import { JobUpdateDTO } from './dto/job-update.dto';
import { JobService } from './job.service';
import { JobSendInvitesDTO } from './dto/job-send-invites.dto';
import { JobStepFilterDTO } from './dto/job-step-filter.dto';
import { UpdateJobImageDTO } from './dto/job-update-image.dto';
import { GetAllJobsQueryParamsDto } from './dto/get-all-jobs-query-params.dto';

@Controller('job')
export class JobController {
  constructor(
    private readonly abilityFactory: CaslAbilityFactory,
    private readonly jobService: JobService,
  ) {}

  @Get()
  async getAllJobs(
    @Query() params,
    @Request() req: { user: ITokenParsePayload },
  ) {
    return this.jobService.findAll(
      params,
      req?.user?.entityId,
      req?.user?.role,
    );
  }

  @Get('jobsInfo')
  @Public()
  async getAllJobsInfo() {
    const statistics = await this.jobService.getJobStatisticsForAllJobs();
    return statistics;
  }

  @Get('filterBySomeField')
  getAllJobsBySomeField(
    @Query() params: GetAllJobsQueryParamsDto,
    @Request() req: { user: ITokenParsePayload },
  ) {
    return this.jobService.findAllJobsWithFliters(
      params,
      req?.user?.entityId,
      req?.user?.role,
    );
  }

  @Get(':id')
  @Public()
  async findJobById(@Param('id') id: string, @Query() params) {
    return this.jobService.findOne(id, params);
  }

  @Post()
  @HttpCode(HttpStatus.CREATED)
  async createJob(
    @Body() job: JobCreateDTO,
    @Request() req: { user: ITokenParsePayload },
  ) {
    const ability = await this.abilityFactory.createFromUserToken(req.user);

    if (
      ability.can(
        PermissionAction.create,
        subject(DefaultSubjects.jobs, req.user),
      )
    ) {
      return this.jobService.createJob(req.user._id, job);
    }
    throw new ForbiddenException();
  }

  @Post(':id/close')
  async closeJob(
    @Param('id') id: string,
    @Request() req: { user: ITokenParsePayload },
  ) {
    const ability = await this.abilityFactory.createFromUserToken(req.user);

    if (
      ability.can(
        PermissionAction.create,
        subject(DefaultSubjects.jobs, req.user),
      )
    ) {
      return this.jobService.closeJob(id);
    }
    throw new ForbiddenException();
  }

  @Post(':id/open')
  async openJob(
    @Param('id') id: string,
    @Request() req: { user: ITokenParsePayload },
  ) {
    const ability = await this.abilityFactory.createFromUserToken(req.user);

    if (
      ability.can(
        PermissionAction.create,
        subject(DefaultSubjects.jobs, req.user),
      )
    ) {
      return this.jobService.openJob(id);
    }
    throw new ForbiddenException();
  }

  @Patch(':id/image')
  async updateJobImage(
    @Param('id') id: string,
    @Body() data: UpdateJobImageDTO,
    @Request() req: { user: ITokenParsePayload },
  ) {
    const ability = await this.abilityFactory.createFromUserToken(req.user);

    if (
      ability.can(
        PermissionAction.update,
        subject(DefaultSubjects.jobs, {
          ...data,
          employer: req.user.entityId,
        }),
      )
    ) {
      return this.jobService.updateJobImage(id, data);
    }
    throw new ForbiddenException();
  }

  @Patch(':id')
  async updateJobById(
    @Param('id') id: string,
    @Body() data: JobUpdateDTO,
    @Request() req: { user: ITokenParsePayload },
  ) {
    const ability = await this.abilityFactory.createFromUserToken(req.user);

    if (
      ability.can(
        PermissionAction.update,
        subject(DefaultSubjects.jobs, {
          ...data,
          employer: data.employer || req.user.entityId,
        }),
      )
    ) {
      return this.jobService.updateJob(id, data);
    }
    throw new ForbiddenException();
  }

  @Delete(':id')
  async deleteJobById(
    @Param('id') id: string,
    @Request() req: { user: ITokenParsePayload },
  ) {
    const ability = await this.abilityFactory.createFromUserToken(req.user);
    const job = await this.jobService.findOne(id);
    if (!job) throw new NotFoundException(`A vaga com id: ${id} não existe.`);

    if (
      ability.can(
        PermissionAction.delete,
        subject(DefaultSubjects.jobs, { employer: job.employer._id }),
      )
    ) {
      return this.jobService.deleteJob(id);
    }
    throw new ForbiddenException();
  }

  @Patch(':jobId/apply')
  async applyToJob(
    @Param('jobId') jobId: string,
    @Body() data: JobApplyDTO,
    @Request() req: { user: ITokenParsePayload },
  ) {
    const job = await this.jobService.findOne(jobId);

    if (!job) {
      throw new NotFoundException(`A vaga com id: ${jobId} não existe.`);
    }

    if (req.user.role !== DefaultRoles.employee) {
      throw new ForbiddenException();
    }

    return this.jobService.applyToJob(jobId, req.user.entityId, data);
  }

  @Patch(':jobId/apply/:candidateId')
  async sendCandidateToJob(
    @Param('jobId') jobId: string,
    @Param('candidateId') id: string,
    @Body() data: JobApplyDTO,
    @Request() req: { user: ITokenParsePayload },
  ) {
    const ability = await this.abilityFactory.createFromUserToken(req.user);

    const job = await this.jobService.findOne(jobId);

    if (!job)
      throw new NotFoundException(`A vaga com id: ${jobId} não existe.`);

    if (
      ability.can(
        PermissionAction.update,
        subject(DefaultSubjects.jobs, {
          employer: job.employer._id,
        }),
      )
    ) {
      return this.jobService.applyToJob(jobId, id, data);
    }

    throw new ForbiddenException();
  }

  @Patch(':jobId/withdraw')
  async withdrawToJob(
    @Param('jobId') jobId: string,
    @Request() req: { user: ITokenParsePayload },
  ) {
    const job = await this.jobService.findOne(jobId);
    if (!job)
      throw new NotFoundException(`A vaga com id: ${jobId} não existe.`);

    if (req.user.role !== DefaultRoles.employee) throw new ForbiddenException();

    return this.jobService.removeCandidateFromJob(jobId, req.user.entityId);
  }

  @Patch(':jobId/toggle-favorite')
  async toggleFavorite(
    @Param('jobId') jobId: string,
    @Request() req: { user: ITokenParsePayload },
  ) {
    if (req.user.role !== DefaultRoles.employee) throw new ForbiddenException();

    return this.jobService.toggleFavoriteJob(jobId, req.user.entityId);
  }

  @Post(':jobId/send-invite/:candidateId')
  async sendJobInvite(
    @Param('jobId') jobId: string,
    @Param('candidateId') candidateId: string,
  ) {
    return this.jobService.sendJobInvite(jobId, candidateId);
  }

  @Post('send-invites')
  async sendJobInvites(@Body() payload: JobSendInvitesDTO) {
    return this.jobService.sendJobInvites(payload);
  }

  @Patch(':jobId/candidates/:id/reprove')
  async reproveCandidateFromJob(
    @Param('jobId') jobId: string,
    @Param('id') id: string,
    @Request() req: { user: ITokenParsePayload },
  ) {
    const ability = await this.abilityFactory.createFromUserToken(req.user);
    const job = await this.jobService.findOne(jobId);
    if (!job)
      throw new NotFoundException(`A vaga com id: ${jobId} não existe.`);

    if (
      ability.can(
        PermissionAction.update,
        subject(DefaultSubjects.jobs, {
          employer: job.employer._id,
        }),
      )
    ) {
      return this.jobService.reproveCandidateFromJob(jobId, id);
    }
    throw new ForbiddenException();
  }

  @Delete(':jobId/candidates/:id')
  async removeCandidateFromJob(
    @Param('jobId') jobId: string,
    @Param('id') id: string,
    @Request() req: { user: ITokenParsePayload },
  ) {
    const ability = await this.abilityFactory.createFromUserToken(req.user);
    const job = await this.jobService.findOne(jobId);
    if (!job)
      throw new NotFoundException(`A vaga com id: ${jobId} não existe.`);

    if (
      ability.can(
        PermissionAction.update,
        subject(DefaultSubjects.jobs, {
          employer: job.employer._id,
        }),
      )
    ) {
      return this.jobService.removeCandidateFromJob(jobId, id);
    }
    throw new ForbiddenException();
  }

  @Post(':jobId/candidates/:id')
  async sendCandidateToSteps(
    @Param('jobId') jobId: string,
    @Param('id') id: string,
    @Request() req: { user: ITokenParsePayload },
  ) {
    const ability = await this.abilityFactory.createFromUserToken(req.user);
    const job = await this.jobService.findOne(jobId);
    if (!job)
      throw new NotFoundException(`A vaga com id: ${jobId} não existe.`);

    if (
      ability.can(
        PermissionAction.update,
        subject(DefaultSubjects.jobs, {
          employer: job.employer._id,
        }),
      )
    ) {
      return this.jobService.sendCandidateToSteps(jobId, id);
    }
    throw new ForbiddenException();
  }

  @Get(':jobId/step/:stepId')
  async findStepByStepId(
    @Param('stepId') id: string,
    @Query() params: JobStepFilterDTO,
  ) {
    return this.jobService.findOneStep(id, params);
  }

  @Post(':jobId/step')
  async addJobStep(
    @Param('jobId') jobId: string,
    @Body() data: JobStepCreateDTO,
    @Request() req: { user: ITokenParsePayload },
  ) {
    const ability = await this.abilityFactory.createFromUserToken(req.user);
    const job = await this.jobService.findOne(jobId);
    if (!job)
      throw new NotFoundException(`A vaga com id: ${jobId} não existe.`);

    if (
      ability.can(
        PermissionAction.update,
        subject(DefaultSubjects.jobs, { employer: job.employer._id }),
      )
    ) {
      return this.jobService.addStep(jobId, data);
    }
    throw new ForbiddenException();
  }

  @Post(':jobId/step/:id')
  async openJobStep(
    @Param('jobId') jobId: string,
    @Param('id') id: string,
    @Request() req: { user: ITokenParsePayload },
  ) {
    const ability = await this.abilityFactory.createFromUserToken(req.user);
    const job = await this.jobService.findOne(jobId);
    if (!job)
      throw new NotFoundException(`A vaga com id: ${jobId} não existe.`);

    if (
      ability.can(
        PermissionAction.update,
        subject(DefaultSubjects.jobs, {
          employer: job.employer._id,
        }),
      )
    ) {
      return this.jobService.openStep(jobId, id);
    }
    throw new ForbiddenException();
  }

  @Post(':jobId/step/:id')
  async closeJobStep(
    @Param('jobId') jobId: string,
    @Param('id') id: string,
    @Request() req: { user: ITokenParsePayload },
  ) {
    const ability = await this.abilityFactory.createFromUserToken(req.user);
    const job = await this.jobService.findOne(jobId);
    if (!job)
      throw new NotFoundException(`A vaga com id: ${jobId} não existe.`);

    if (
      ability.can(
        PermissionAction.update,
        subject(DefaultSubjects.jobs, {
          employer: job.employer._id,
        }),
      )
    ) {
      return this.jobService.closeStep(jobId, id);
    }
    throw new ForbiddenException();
  }

  @Patch(':jobId/step/:id')
  async updateJobStep(
    @Param('jobId') jobId: string,
    @Param('id') id: string,
    @Body() data: JobStepUpdateDTO,
    @Request() req: { user: ITokenParsePayload },
  ) {
    const ability = await this.abilityFactory.createFromUserToken(req.user);
    const job = await this.jobService.findOne(jobId);
    if (!job)
      throw new NotFoundException(`A vaga com id: ${jobId} não existe.`);

    if (
      ability.can(
        PermissionAction.update,
        subject(DefaultSubjects.jobs, {
          ...data,
          employer: job.employer._id,
        }),
      )
    ) {
      return this.jobService.updateStep(jobId, id, data);
    }
    throw new ForbiddenException();
  }

  @Delete(':jobId/step/:id')
  async deleteJobStep(
    @Param('jobId') jobId: string,
    @Param('id') id: string,
    @Request() req: { user: ITokenParsePayload },
  ) {
    const ability = await this.abilityFactory.createFromUserToken(req.user);
    const job = await this.jobService.findOne(jobId);
    if (!job)
      throw new NotFoundException(`A vaga com id: ${jobId} não existe.`);

    if (
      ability.can(
        PermissionAction.update,
        subject(DefaultSubjects.jobs, { employer: job.employer._id }),
      )
    ) {
      return this.jobService.removeStep(jobId, id);
    }
    throw new ForbiddenException();
  }

  @Post(':jobId/step/:stepId/candidate/:id')
  async addCandidate(
    @Param('jobId') jobId: string,
    @Param('stepId') stepId: string,
    @Param('id') id: string,
    @Request() req: { user: ITokenParsePayload },
  ) {
    const ability = await this.abilityFactory.createFromUserToken(req.user);
    const job = await this.jobService.findOne(jobId);
    if (!job)
      throw new NotFoundException(`A vaga com id: ${jobId} não existe.`);

    if (
      ability.can(
        PermissionAction.update,
        subject(DefaultSubjects.jobs, { employer: job.employer._id }),
      )
    ) {
      return this.jobService.addCandidate(jobId, stepId, id);
    }
    throw new ForbiddenException();
  }

  @Delete(':jobId/step/:stepId/candidate/:id')
  async deleteCandidate(
    @Param('jobId') jobId: string,
    @Param('stepId') stepId: string,
    @Param('id') id: string,
    @Request() req: { user: ITokenParsePayload },
  ) {
    const ability = await this.abilityFactory.createFromUserToken(req.user);
    const job = await this.jobService.findOne(jobId);
    if (!job)
      throw new NotFoundException(`A vaga com id: ${jobId} não existe.`);

    if (
      ability.can(
        PermissionAction.update,
        subject(DefaultSubjects.jobs, { employer: job.employer._id }),
      )
    ) {
      return this.jobService.removeCandidate(jobId, stepId, id);
    }
    throw new ForbiddenException();
  }

  @Post(':jobId/step/:stepId/candidate/:id/approve')
  async approveCandidate(
    @Param('jobId') jobId: string,
    @Param('stepId') stepId: string,
    @Param('id') id: string,
    @Body() data: ApproveReproveCandidateDTO,
    @Request() req: { user: ITokenParsePayload },
  ) {
    const ability = await this.abilityFactory.createFromUserToken(req.user);
    const job = await this.jobService.findOne(jobId);
    if (!job)
      throw new NotFoundException(`A vaga com id: ${jobId} não existe.`);

    if (
      ability.can(
        PermissionAction.update,
        subject(DefaultSubjects.jobs, {
          employer: job.employer._id,
        }),
      )
    ) {
      return this.jobService.approveCandidate(jobId, stepId, id, data);
    }
    throw new ForbiddenException();
  }

  @Post(':jobId/step/:stepId/candidates/approve')
  async approveCandidates(
    @Param('jobId') jobId: string,
    @Param('stepId') stepId: string,
    @Body() data: ApproveReproveCandidatesDTO,
    @Request() req: { user: ITokenParsePayload },
  ) {
    const ability = await this.abilityFactory.createFromUserToken(req.user);
    const job = await this.jobService.findOne(jobId);
    if (!job)
      throw new NotFoundException(`A vaga com id: ${jobId} não existe.`);

    if (
      ability.can(
        PermissionAction.update,
        subject(DefaultSubjects.jobs, {
          employer: job.employer._id,
        }),
      )
    ) {
      return this.jobService.approveCandidates(jobId, stepId, data);
    }
    throw new ForbiddenException();
  }

  @Post(':jobId/step/:stepId/candidate/:id/reprove')
  async reproveCandidate(
    @Param('jobId') jobId: string,
    @Param('stepId') stepId: string,
    @Param('id') id: string,
    @Body() data: ApproveReproveCandidateDTO,
    @Request() req: { user: ITokenParsePayload },
  ) {
    const ability = await this.abilityFactory.createFromUserToken(req.user);
    const job = await this.jobService.findOne(jobId);
    if (!job)
      throw new NotFoundException(`A vaga com id: ${jobId} não existe.`);

    if (
      ability.can(
        PermissionAction.update,
        subject(DefaultSubjects.jobs, {
          employer: job.employer._id,
        }),
      )
    ) {
      return this.jobService.reproveCandidate(jobId, stepId, id, data);
    }
    throw new ForbiddenException();
  }

  @Post(':jobId/step/:stepId/candidates/reprove')
  async reproveCandidates(
    @Param('jobId') jobId: string,
    @Param('stepId') stepId: string,
    @Body() data: ApproveReproveCandidatesDTO,
    @Request() req: { user: ITokenParsePayload },
  ) {
    const ability = await this.abilityFactory.createFromUserToken(req.user);
    const job = await this.jobService.findOne(jobId);
    if (!job)
      throw new NotFoundException(`A vaga com id: ${jobId} não existe.`);

    if (
      ability.can(
        PermissionAction.update,
        subject(DefaultSubjects.jobs, {
          employer: job.employer._id,
        }),
      )
    ) {
      return this.jobService.reproveCandidates(jobId, stepId, data);
    }
    throw new ForbiddenException();
  }

  @Get(':jobId/suggestion')
  @Public()
  getSuggestionJobs(@Param('jobId') jobId: string, @Query() params) {
    return this.jobService.getSuggestionJobs(jobId, params);
  }
}