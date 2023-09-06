import { Body, Controller, Get, Post } from '@nestjs/common';
import { BenefitService } from './benefit.service';
import { BenefitCreateDTO } from './dto/benefit-create.dto';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import * as swaggerDescription from '../../../docs/swagger.json';
import { Public } from '../../shared/decorators';

const benefitsModuleDocs = swaggerDescription.modules.Benefits;
const interfacesDocs = benefitsModuleDocs.paths;

@Controller('benefits')
@ApiTags(benefitsModuleDocs.name)
export class BenefitController {
  constructor(private readonly benefitService: BenefitService) {}

  @Public()
  @Get()
  @ApiOperation(interfacesDocs.get['/'].operation)
  @ApiResponse(interfacesDocs.get['/'].responses['200'])
  @ApiResponse(interfacesDocs.get['/'].responses['404'])
  @ApiResponse(interfacesDocs.get['/'].responses['500'])
  getAll() {
    return this.benefitService.findAll();
  }

  @Post()
  @ApiOperation(interfacesDocs.post['/'].operation)
  @ApiResponse(interfacesDocs.post['/'].responses['200'])
  @ApiResponse(interfacesDocs.post['/'].responses['404'])
  @ApiResponse(interfacesDocs.post['/'].responses['500'])
  createBenefit(@Body() data: BenefitCreateDTO) {
    return this.benefitService.createBenefit([data]);
  }
}
