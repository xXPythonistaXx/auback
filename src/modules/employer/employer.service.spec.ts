import { Test, TestingModule } from '@nestjs/testing';
import { EmployerService } from './employer.service';
import { getModelToken } from '@nestjs/mongoose';
import { Employer } from '@schemas';
import {
  closeInMongodConnection,
  rootMongooseTestModule,
} from '../../../test/helpers/in-memory-db';
import { UserService } from '../user/user.service';
import { MailService } from '../mail/mail.service';
import { ConfigModule } from '@nestjs/config';
import { RoleService } from '../authorization/role/role.service';
import { AwsS3Service } from '../aws-s3/aws-s3.service';
import { EmployeeService } from '../employee/employee.service';
import { Readable } from 'stream';
import { getUserEmployerMock } from '../../../test/__mocks__';

const s3ServiceSpy = {
  removeMedia: jest.fn(),
  uploadMedia: jest.fn(),
};

const mockFile: Express.Multer.File = {
  fieldname: 'avatar',
  originalname: 'avatar.jpg',
  encoding: '7bit',
  mimetype: 'image/jpeg',
  size: 1024,
  destination: '/uploads',
  filename: 'avatar-123.jpg',
  path: '/uploads/avatar-123.jpg',
  buffer: Buffer.from('test'),
  stream: new Readable(),
};

const employerMock = getUserEmployerMock();

describe('EmployerService', () => {
  let sut: EmployerService;

  beforeAll(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [rootMongooseTestModule(), ConfigModule],
      providers: [
        EmployerService,
        {
          provide: getModelToken(Employer.name),
          useValue: {
            findOneAndUpdate: jest.fn().mockReturnValue({
              lean: jest.fn().mockReturnValue({
                exec: jest.fn().mockResolvedValue(employerMock),
              }),
            }),
          },
        },
        {
          provide: UserService,
          useValue: {},
        },
        {
          provide: MailService,
          useValue: {},
        },

        {
          provide: RoleService,
          useValue: {},
        },
        {
          provide: AwsS3Service,
          useValue: s3ServiceSpy,
        },
        {
          provide: EmployeeService,
          useValue: {},
        },
      ],
    }).compile();

    sut = module.get<EmployerService>(EmployerService);
  });

  afterAll(async () => {
    await closeInMongodConnection();
  });

  afterEach(() => {
    s3ServiceSpy.removeMedia.mockReset();
  });

  it('should be defined', () => {
    expect(sut).toBeDefined();
  });

  describe('when user has profile image save on db', () => {
    let userUpdated;

    beforeAll(async () => {
      jest.spyOn(sut, 'findByUserId').mockResolvedValue(employerMock as any);

      s3ServiceSpy.uploadMedia.mockResolvedValue({
        key: 'any_key',
        location: 'any_location',
      });

      userUpdated = await sut.updateProfileImage(employerMock._id, mockFile);
    });

    it('should call s3-service for remove media', () => {
      expect(s3ServiceSpy.removeMedia).toBeCalledWith(
        employerMock.profileImage.key,
      );
    });

    it('should not return password of user', () => {
      expect(userUpdated.user.password).toBeUndefined();
    });

    it('should userUpdated is defined', () => {
      expect(userUpdated).toBeDefined();
    });
  });

  describe('when user dont send the profile image', () => {
    beforeAll(async () => {
      jest.spyOn(sut, 'findByUserId').mockResolvedValue({} as any);

      s3ServiceSpy.uploadMedia.mockResolvedValue({
        key: 'any_key',
        location: 'any_location',
      });
      await sut.updateProfileImage(employerMock._id, mockFile);
    });

    it('remove media not expected', () => {
      expect(s3ServiceSpy.removeMedia).not.toBeCalled();
    });
  });
});
