import { CONFIG } from '@config/index';
import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Auth, google } from 'googleapis';

@Injectable()
export class GoogleAuthenticationService {
  private googleOauthClient: Auth.OAuth2Client;

  constructor(private readonly configService: ConfigService) {
    const clientID = configService.get<string>(CONFIG.GOOGLE_CLIENT_ID);
    const clientSecret = configService.get<string>(CONFIG.GOOGLE_CLIENT_SECRET);
    this.googleOauthClient = new google.auth.OAuth2(clientID, clientSecret);
  }

  getInfoToken(token: string) {
    return this.googleOauthClient.getTokenInfo(token);
  }

  async getUserData(token: string) {
    const userInfoClient = google.oauth2('v2').userinfo;

    this.googleOauthClient.setCredentials({
      access_token: token,
    });

    const userInfoResponse = await userInfoClient.get({
      auth: this.googleOauthClient,
    });

    return userInfoResponse.data;
  }
}
