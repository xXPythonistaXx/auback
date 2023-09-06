import { Body, Controller, Get, Post, Query } from '@nestjs/common';
import { ToolCreateDTO } from './dto/tool-create.dto';
import { ToolService } from './tool.service';
import { Public } from '../../shared/decorators';

@Controller('tool')
export class ToolController {
  constructor(private readonly toolService: ToolService) {}

  @Public()
  @Get()
  getAll(@Query() params) {
    return this.toolService.findAll(params);
  }

  @Post()
  createLanguage(@Body() data: ToolCreateDTO) {
    return this.toolService.createTool([data]);
  }
}
