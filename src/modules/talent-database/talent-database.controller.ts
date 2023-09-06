import { Controller, Get, Param, Query } from '@nestjs/common';
import { TalentDatabaseService } from './talent-database.service';
import { GetAllTalentsQueryParamsDto } from './dto/get-all-talents-query-params.dto';

@Controller('employer/talent-database')
export class TalentDatabaseController {
  constructor(private readonly talentService: TalentDatabaseService) {}

  @Get()
  getAllTalents(@Query() params: GetAllTalentsQueryParamsDto) {
    return this.talentService.findAllTalents(params);
  }

  @Get(':id')
  getTalentById(@Param('id') id: string) {
    return this.talentService.findTalentById(id);
  }
}
