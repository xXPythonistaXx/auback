import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Request,
} from '@nestjs/common';
import { MacroJobService } from './macro-job.service';
import { MacroJobUpdateDTO } from './dto/macro-job-update.dto';
import { MacroJobCreateDTO } from './dto/macro-job-create.dto';
import { MacroJob } from 'src/schemas/macro-job/macro-job.schema';
import { ITokenParsePayload } from '@shared/interfaces';
import { Public } from '@shared/decorators';

@Controller('macro-job')
export class MacroJobController {
  constructor(private readonly macroJobService: MacroJobService) {}

  @Post()
  create(
    @Body() createMacroJobDto: MacroJobCreateDTO,
    @Request() req: { user: ITokenParsePayload },
  ) {
    return this.macroJobService.create(createMacroJobDto, req.user._id);
  }

  @Public()
  @Get()
  findAll() {
    return this.macroJobService.findAll();
  }

  @Public()
  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.macroJobService.findOne(id);
  }

  @Patch(':id')
  update(
    @Param('id') id: string,
    @Body() updateMacroJobDto: MacroJobUpdateDTO,
  ) {
    return this.macroJobService.update(id, updateMacroJobDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.macroJobService.remove(id);
  }

  @Post(':id/add-jobs')
  async addJobsToMacroJob(
    @Param('id') id: string,
    @Body('jobIds') jobIds: string[],
  ): Promise<MacroJob> {
    return this.macroJobService.addJobsToMacroJob(id, jobIds);
  }

  @Post(':id/remove-jobs')
  async removeJobsToMacroJob(
    @Param('id') id: string,
    @Body('jobIds') jobIds: string[],
  ): Promise<MacroJob> {
    return this.macroJobService.removeJobsFromMacroJob(id, jobIds);
  }
}
