import { Controller, Get, Query } from '@nestjs/common';
import { UniversityService } from './university.service';
import { Public } from '../../shared/decorators';

@Controller('university')
export class UniversityController {
  constructor(private readonly universityService: UniversityService) {}

  @Public()
  @Get()
  getAll(@Query() params) {
    return this.universityService.findAll(params);
  }
}
