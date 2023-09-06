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
  UploadedFile,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { Public } from '@shared/decorators';
import { DefaultSubjects, PermissionAction } from '@shared/enums';
import { ITokenParsePayload } from '@shared/interfaces';
import { CaslAbilityFactory } from '../authorization/casl-ability.factory';
import { AcademicBackgroundCreateDTO } from './dto/academic-background-create.dto';
import { AcademicBackgroundUpdateDTO } from './dto/academic-background-update.dto';
import { EmployeeCertificateCreateDTO } from './dto/employee-certificate-create.dto';
import { EmployeeCertificateUpdateDTO } from './dto/employee-certificate-update.dto';
import { EmployeeExperienceCreateDTO } from './dto/employee-experience-create.dto';
import { EmployeeExperienceUpdateDTO } from './dto/employee-experience-update.dto';
import { EmployeeLanguageCreateDTO } from './dto/employee-language-create.dto';
import { EmployeeLanguageUpdateDTO } from './dto/employee-language-update.dto';
import { LocalEmployeeSignupDTO } from './dto/employee-signup.dto';
import { EmployeeToolCreateDTO } from './dto/employee-tool-create.dto';
import { EmployeeToolUpdateDTO } from './dto/employee-tool-update.dto';
import { EmployeeUpdateDTO } from './dto/employee-update.dto';
import { EmployeeService } from './employee.service';
import { EmployeeUpdateImage } from './dto/employee-update-image.dto';
import * as swaggerDescription from '../../../docs/swagger.json';
import { ApiOperation, ApiTags } from '@nestjs/swagger';

const courseModuleDocs = swaggerDescription.modules.Course;
const interfacesDocs = courseModuleDocs.paths;

@ApiTags(courseModuleDocs.name)
@Controller('employee')
export class EmployeeController {
  constructor(
    private readonly abilityFactory: CaslAbilityFactory,
    private readonly employeeService: EmployeeService,
  ) {}

  @Public()
  @Post('/local/signup')
  @HttpCode(HttpStatus.CREATED)
  signup(@Body() data: LocalEmployeeSignupDTO) {
    return this.employeeService.signup(data);
  }

  @Get('dashboard')
  async getDashboard(@Request() req: { user: ITokenParsePayload }) {
    const ability = await this.abilityFactory.createForUser(req.user as any);

    if (ability.can(PermissionAction.read, DefaultSubjects.employees)) {
      return this.employeeService.getDashboard(req.user.entityId);
    }
    throw new ForbiddenException();
  }

  @Patch()
  async updateEmployee(
    @Body() data: EmployeeUpdateDTO,
    @Request() req: { user: ITokenParsePayload },
  ) {
    const ability = await this.abilityFactory.createForUser(req.user as any);

    if (ability.can(PermissionAction.update, DefaultSubjects.employees)) {
      return this.employeeService.updateEmployeeByUserId(req.user._id, data);
    }
    throw new ForbiddenException();
  }

  @Patch('image')
  @UseInterceptors(FileInterceptor('image'))
  async updateProfileImage(
    @Body() { image }: EmployeeUpdateImage,
    @Request() req: { user: ITokenParsePayload },
  ) {
    const ability = await this.abilityFactory.createForUser(req.user as any);

    if (ability.can(PermissionAction.update, DefaultSubjects.employees)) {
      return this.employeeService.updateProfileImage(req.user._id, image);
    }
    throw new ForbiddenException();
  }

  @Post('academic-background')
  async addAcademicBackground(
    @Body() data: AcademicBackgroundCreateDTO,
    @Request() req: { user: ITokenParsePayload },
  ) {
    return this.employeeService.addEmployeeAcademicBackground(
      req.user._id,
      data,
    );
  }

  @Patch('academic-background')
  async updateAcademicBackground(
    @Body() data: AcademicBackgroundUpdateDTO,
    @Request() req: { user: ITokenParsePayload },
  ) {
    return this.employeeService.updateEmployeeAcademicBackground(
      req.user._id,
      data,
    );
  }

  @Delete('academic-background/:id')
  async deleteAcademicBackgrounds(
    @Param('id') id: string,
    @Request() req: { user: ITokenParsePayload },
  ) {
    return this.employeeService.deleteEmployeeAcademicBackground(
      req.user._id,
      id,
    );
  }

  @Post('experience')
  async addExperience(
    @Body() data: EmployeeExperienceCreateDTO,
    @Request() req: { user: ITokenParsePayload },
  ) {
    return this.employeeService.addEmployeeExperience(req.user._id, data);
  }

  @Patch('experience')
  async updateExperience(
    @Body() data: EmployeeExperienceUpdateDTO,
    @Request() req: { user: ITokenParsePayload },
  ) {
    return this.employeeService.updateEmployeeExperience(req.user._id, data);
  }

  @Delete('experience/:id')
  async deleteExperiences(
    @Param('id') id: string,
    @Request() req: { user: ITokenParsePayload },
  ) {
    return this.employeeService.deleteEmployeeExperience(req.user._id, id);
  }

  @Post('language')
  async addLanguages(
    @Body() data: EmployeeLanguageCreateDTO,
    @Request() req: { user: ITokenParsePayload },
  ) {
    return this.employeeService.addEmployeeLanguage(req.user._id, data);
  }

  @Patch('language')
  async updateLanguages(
    @Body() data: EmployeeLanguageUpdateDTO,
    @Request() req: { user: ITokenParsePayload },
  ) {
    return this.employeeService.updateEmployeeLanguage(req.user._id, data);
  }

  @Delete('language/:id')
  async deleteLanguages(
    @Param('id') id: string,
    @Request() req: { user: ITokenParsePayload },
  ) {
    return this.employeeService.deleteEmployeeLanguage(req.user._id, id);
  }

  @Post('tool')
  async addTools(
    @Body() data: EmployeeToolCreateDTO,
    @Request() req: { user: ITokenParsePayload },
  ) {
    return this.employeeService.addEmployeeTool(req.user._id, data);
  }

  @Patch('tool')
  async updateTools(
    @Body() data: EmployeeToolUpdateDTO,
    @Request() req: { user: ITokenParsePayload },
  ) {
    return this.employeeService.updateEmployeeTool(req.user._id, data);
  }

  @Delete('tool/:id')
  async deleteTools(
    @Param('id') id: string,
    @Request() req: { user: ITokenParsePayload },
  ) {
    return this.employeeService.deleteEmployeeTool(req.user._id, id);
  }

  @Post('certificate')
  async addCertificates(
    @Body() data: EmployeeCertificateCreateDTO,
    @Request() req: { user: ITokenParsePayload },
  ) {
    return this.employeeService.addEmployeeCertificate(req.user._id, data);
  }

  @Patch('certificate')
  async updateCertificates(
    @Body() data: EmployeeCertificateUpdateDTO,
    @Request() req: { user: ITokenParsePayload },
  ) {
    return this.employeeService.updateEmployeeCertificate(req.user._id, data);
  }

  @Delete('certificate/:id')
  async deleteCertificates(
    @Param('id') id: string,
    @Request() req: { user: ITokenParsePayload },
  ) {
    return this.employeeService.deleteEmployeeCertificate(req.user._id, id);
  }

  @Patch('profilePdf')
  @UseInterceptors(FileInterceptor('employeeResumePdf'))
  async updateEmployeeCurriculum(
    @UploadedFile() file: Express.Multer.File,
    @Request() req: { user: ITokenParsePayload },
  ) {
    const ability = await this.abilityFactory.createForUser(req.user as any);

    if (ability.can(PermissionAction.update, DefaultSubjects.employees)) {
      return this.employeeService.updateEmployeeCurriculum(req.user._id, file);
    }
    throw new ForbiddenException();
  }

  @Get('statistics')
  @ApiOperation(interfacesDocs.get.course.operation)
  @Public()
  async getEmployeeStatistics(
    @Query('completeLearnInfo') completeLearnInfo: boolean,
  ) {
    try {
      const statistics = await this.employeeService.getEmployeeStatistics(
        completeLearnInfo,
      );
      return statistics;
    } catch (error) {
      throw error;
    }
  }
}
