import {
  Body,
  Controller,
  Get,
  Post,
  Query,
  UploadedFile,
  UseInterceptors,
} from '@nestjs/common';
import { CourseService } from './course.service';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import * as swaggerDescription from '../../../docs/swagger.json';
import { FileInterceptor } from '@nestjs/platform-express';
import { Course } from '@schemas';
import * as Papa from 'papaparse';
import { Public } from '../../shared/decorators';

const courseModuleDocs = swaggerDescription.modules.Course;
const interfacesDocs = courseModuleDocs.paths;

@ApiTags(courseModuleDocs.name)
@Controller('course')
export class CourseController {
  constructor(private readonly courseService: CourseService) {}

  @Public()
  @Get()
  @ApiOperation(interfacesDocs.get.course.operation)
  @ApiResponse(interfacesDocs.get.course.responses['200'])
  @ApiResponse(interfacesDocs.get.course.responses['404'])
  @ApiResponse(interfacesDocs.get.course.responses['500'])
  getAll(@Query() params) {
    return this.courseService.findAll(params);
  }

  @Post('create')
  @ApiOperation(interfacesDocs.post.course.operation)
  @ApiResponse(interfacesDocs.post.course.responses['201'])
  create(@Body() course: Course) {
    return this.courseService.create(course);
  }

  @Post('upload')
  @ApiOperation(interfacesDocs.post.upload.operation)
  @ApiResponse(interfacesDocs.post.upload.responses['201'])
  @UseInterceptors(FileInterceptor('file'))
  async upload(@UploadedFile() file) {
    const csvData = file.buffer.toString('utf8');
    const results = Papa.parse(csvData, { header: true });
    const courses = results.data.map((result: Course) => ({
      name: result.name,
      codigo: result.codigo,
      tipoCurso: result.tipoCurso,
    })) as Course[];
    return this.courseService.createMany(courses);
  }
}
