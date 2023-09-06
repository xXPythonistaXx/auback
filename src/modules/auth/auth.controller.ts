import {
  Body,
  Controller,
  Get,
  Post,
  Put,
  Query,
  Request,
  UseGuards,
} from '@nestjs/common';
import { Public } from '@shared/decorators';
import { LocalAuthGuard } from '@shared/guards';
import { ITokenParsePayload, IUserWithoutPass } from '@shared/interfaces';
import { AuthService } from './auth.service';
import { SocialSigninDTO } from './dto/auth.dto';
import { RefreshTokenDTO } from './dto/refresh-token.dto';
import QueryResetPasswordDTO, {
  RequestResetPasswordDTO,
  ResetPasswordDTO,
} from './dto/reset-password.dto';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import * as swaggerDescription from '../../../docs/swagger.json';

const authModuleDocs = swaggerDescription.modules.Auth;
const interfacesDocs = authModuleDocs.paths;

@Controller('auth')
@ApiTags(authModuleDocs.name)
export class AuthController {
  constructor(private authService: AuthService) {}

  @Public()
  @UseGuards(LocalAuthGuard)
  @Post('/local/signin')
  @ApiOperation(interfacesDocs.post.signin.operation)
  @ApiResponse(interfacesDocs.post.signin.responses['200'])
  @ApiResponse(interfacesDocs.post.signin.responses['404'])
  @ApiResponse(interfacesDocs.post.signin.responses['500'])
  async signin(@Request() req: { user: IUserWithoutPass }) {
    const { _id: id, email, role } = req.user;
    return this.authService.signin({ _id: id, email, role: role.name });
  }

  @Public()
  @Put('refresh')
  @ApiOperation(interfacesDocs.put.refresh.operation)
  @ApiResponse(interfacesDocs.put.refresh.responses['200'])
  async refreshToken(@Body() { refreshToken }: RefreshTokenDTO) {
    return this.authService.refreshToken(refreshToken);
  }

  @Public()
  @Post('google')
  @ApiOperation(interfacesDocs.post.google.operation)
  @ApiResponse(interfacesDocs.post.google.responses['200'])
  googleAuthenticate(@Body() { token }: SocialSigninDTO) {
    return this.authService.googleSignin(token);
  }

  @Public()
  @Post('facebook')
  @ApiOperation(interfacesDocs.post.facebook.operation)
  @ApiResponse(interfacesDocs.post.facebook.responses['200'])
  facebookAuthenticate(@Body() { token }: SocialSigninDTO) {
    return this.authService.facebookSignin(token);
  }

  @Public()
  @Post('/local/request-reset-password')
  @ApiOperation(interfacesDocs.post.facebook.operation)
  requestResetPassword(@Body() { email }: RequestResetPasswordDTO) {
    return this.authService.requestResetPasswordCode(email);
  }

  @Public()
  @Put('/local/reset-password')
  @ApiOperation(interfacesDocs.post.requestResetPassword.operation)
  resetPassword(
    @Query() { token, userId }: QueryResetPasswordDTO,
    @Body() { newPassword }: ResetPasswordDTO,
  ) {
    return this.authService.resetPassword(token, userId, newPassword);
  }

  @Public()
  @Put('/local/confirm-email')
  @ApiOperation(interfacesDocs.put.confirmEmail.operation)
  @ApiResponse(interfacesDocs.put.confirmEmail.responses['200'])
  confirmEmail(@Query('token') token: string, @Query('userId') userId: string) {
    return this.authService.confirmEmail(userId, token);
  }

  @Public()
  @Put('/local/resend-email-confirmation')
  @ApiOperation(interfacesDocs.put.resendEmailConfirmation.operation)
  @ApiResponse(interfacesDocs.put.resendEmailConfirmation.responses['200'])
  resendEmailConfirmation(@Query('email') email: string) {
    return this.authService.resendEmailConfirmation(email);
  }

  @Get('me')
  @ApiOperation(interfacesDocs.get.me.operation)
  @ApiResponse(interfacesDocs.get.me.responses['200'])
  getProfile(@Request() req: { user: ITokenParsePayload }) {
    return this.authService.getProfile(req.user);
  }
}
