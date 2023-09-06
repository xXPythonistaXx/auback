/* eslint-disable no-underscore-dangle */
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
import { EmployerAddressUpdateDTO } from './dto/employer-address-update.dto';
import { EmployerBenefitDTO } from './dto/employer-benefit.dto';
import { LocalEmployerSignupDTO } from './dto/employer-signup.dto';
import { EmployerUpdateDTO } from './dto/employer-update.dto';
import { EmployerService } from './employer.service';
@Controller('employer')
export class EmployerController {
  constructor(
    private readonly abilityFactory: CaslAbilityFactory,
    private readonly employerService: EmployerService,
  ) {}

  @Get()
  async getAllEmployers(@Query() params) {
    return this.employerService.findAllEmployers(params);
  }

  @Public()
  @Post('/local/signup')
  @HttpCode(HttpStatus.CREATED)
  signup(@Body() signupDto: LocalEmployerSignupDTO) {
    return this.employerService.signup(signupDto);
  }

  @Get('dashboard')
  async getDashboard(@Request() req: { user: ITokenParsePayload }) {
    const ability = await this.abilityFactory.createForUser(req.user as any);

    if (ability.can(PermissionAction.read, DefaultSubjects.employers)) {
      return this.employerService.getDashboard(req.user.entityId);
    }
    throw new ForbiddenException();
  }

  @Patch()
  async updateEmployer(
    @Body() data: EmployerUpdateDTO,
    @Request() req: { user: ITokenParsePayload },
  ) {
    const ability = await this.abilityFactory.createForUser(req.user as any);

    if (ability.can(PermissionAction.update, DefaultSubjects.employers)) {
      return this.employerService.updateEmployerByUserId(req.user._id, data);
    }
    throw new ForbiddenException();
  }

  @Patch('image')
  @UseInterceptors(FileInterceptor('image'))
  async updateProfileImage(
    @UploadedFile() file: Express.Multer.File,
    @Request() req: { user: ITokenParsePayload },
    @Body() data: any,
  ) {
    let profileImageFile: any = file;
    const ability = await this.abilityFactory.createForUser(req.user as any);
    if (!file) {
      profileImageFile = { buffer: Buffer.from(data.image, 'base64') };
    }

    if (ability.can(PermissionAction.update, DefaultSubjects.employers)) {
      return this.employerService.updateProfileImage(
        req.user._id,
        profileImageFile,
      );
    }
    throw new ForbiddenException();
  }

  @Patch('update/:id')
  async updateEmployerById(
    @Param('id') id: string,
    @Body() data: EmployerUpdateDTO,
    @Request() req: { user: ITokenParsePayload },
  ) {
    const ability = await this.abilityFactory.createForUser(req.user as any);

    if (ability.can(PermissionAction.update, DefaultSubjects.employers)) {
      return this.employerService.updateEmployerById(id, data);
    }
    throw new ForbiddenException();
  }

  @Patch('/toggle-favorite/:candidateId')
  async toggleCandidateFavorite(
    @Param('candidateId') candidateId: string,
    @Body() data: EmployerUpdateDTO,
    @Request() req: { user: ITokenParsePayload },
  ) {
    const ability = await this.abilityFactory.createForUser(req.user as any);

    if (ability.can(PermissionAction.update, DefaultSubjects.employers)) {
      return this.employerService.toggleFavoriteEmployee(
        candidateId,
        req.user.entityId,
      );
    }
    throw new ForbiddenException();
  }

  @Patch('address')
  async updateAddress(
    @Body() data: EmployerAddressUpdateDTO,
    @Request() req: { user: ITokenParsePayload },
  ) {
    return this.employerService.updateEmployerAddress(req.user._id, data);
  }

  @Patch('segment/:id')
  async updateSegment(
    @Param('id') id: string,
    @Request() req: { user: ITokenParsePayload },
  ) {
    return this.employerService.updateEmployerSegment(req.user._id, id);
  }

  @Delete('segment')
  async deleteSegments(@Request() req: { user: ITokenParsePayload }) {
    return this.employerService.deleteEmployerSegment(req.user._id);
  }

  @Patch('benefits')
  async updateBenefit(
    @Body() data: EmployerBenefitDTO,
    @Request() req: { user: ITokenParsePayload },
  ) {
    return this.employerService.updateEmployerBenefit(req.user._id, data._ids);
  }

  @Delete('benefit/:id')
  async deleteBenefit(
    @Param('id') id: string,
    @Request() req: { user: ITokenParsePayload },
  ) {
    return this.employerService.deleteEmployerBenefit(req.user._id, id);
  }

  @Public()
  @Get('publicInfo/:slug')
  async getAllPublicEmployers(@Param('slug') slug: string, @Query() params) {
    return this.employerService.findAllPublicEmployers(slug, params);
  }
}
