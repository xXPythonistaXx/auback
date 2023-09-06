import { Test, TestingModule } from '@nestjs/testing';
import { AuthService } from './auth.service';
import { UserService } from '../user/user.service';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { MailService } from '../mail/mail.service';
import { EmployeeService } from '../employee/employee.service';
import { EmployerService } from '../employer/employer.service';
import { GoogleAuthenticationService } from './google.service';
import { FacebookAuthService } from 'facebook-auth-nestjs';
import { getModelToken } from '@nestjs/mongoose';
import { RefreshToken } from '@schemas';

describe('AuthService', () => {
  let service: AuthService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        {
          provide: getModelToken(RefreshToken.name),
          useValue: {},
        },
        {
          provide: UserService,
          useValue: {},
        },
        {
          provide: JwtService,
          useValue: {},
        },
        {
          provide: ConfigService,
          useValue: {
            get: jest.fn(),
          },
        },
        {
          provide: MailService,
          useValue: {},
        },
        {
          provide: MailService,
          useValue: {},
        },
        {
          provide: EmployeeService,
          useValue: {},
        },
        {
          provide: EmployerService,
          useValue: {},
        },
        {
          provide: GoogleAuthenticationService,
          useValue: {},
        },
        {
          provide: FacebookAuthService,
          useValue: {},
        },
      ],
    }).compile();

    service = module.get<AuthService>(AuthService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
