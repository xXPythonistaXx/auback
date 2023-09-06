import { Body, Controller, Get, Post, Query } from '@nestjs/common';
import { SegmentCreateDTO } from './dto/segment-create.dto';
import { SegmentService } from './segment.service';

@Controller('segments')
export class SegmentController {
  constructor(private readonly segmentService: SegmentService) {}

  @Get()
  getAll(@Query() params) {
    return this.segmentService.findAll(params);
  }

  @Post()
  createSegment(@Body() data: SegmentCreateDTO) {
    return this.segmentService.createSegment([data]);
  }
}
