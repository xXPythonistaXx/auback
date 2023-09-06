/* eslint-disable @typescript-eslint/restrict-template-expressions */
/* eslint-disable @typescript-eslint/lines-between-class-members */
/* eslint-disable no-unused-vars */
/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/require-await */
import {
  PutObjectCommand,
  PutObjectCommandInput,
  S3,
} from '@aws-sdk/client-s3';
import { CONFIG } from '@config/index';
import { PinoService } from '@modules/logger/pino.service';
import { BadRequestException, Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { ErrorCodes } from '@shared/enums';

@Injectable()
export class AwsS3Service {
  private accessData: {
    region: string;
    credentials: {
      accessKeyId: string;
      secretAccessKey: string;
    };
  };
  private bucketName: string;
  private s3: S3;

  constructor(
    private configService: ConfigService,
    private readonly logger: PinoService,
  ) {
    this.bucketName = this.configService.get<string>(
      CONFIG.AWS_PUBLIC_BUCKET_NAME,
    );
    this.accessData = {
      region: this.configService.get<string>(CONFIG.AWS_REGION),
      credentials: {
        accessKeyId: this.configService.get<string>(CONFIG.AWS_ACCESS_KEY_ID),
        secretAccessKey: this.configService.get<string>(
          CONFIG.AWS_SECRET_ACCESS_KEY,
        ),
      },
    };

    this.s3 = new S3(this.accessData);
  }

  public async uploadMedia(
    file: any,
    path: string,
    ContentType: string | boolean = false,
  ): Promise<{
    location: string;
    key: string;
  }> {
    try {
      const params: PutObjectCommandInput = {
        Body: file.buffer,
        Bucket: this.bucketName,
        Key: path,
      };

      if (ContentType && ContentType !== true) {
        params.ContentType = ContentType;
      }
      const command = new PutObjectCommand(params);
      await this.s3.send(command);

      const fileInformation = {
        key: path,
        location: `https://${this.bucketName}.s3.amazonaws.com/${path}`,
      };

      this.logger.error('AWS-S3 - image file uploaded', fileInformation);

      return fileInformation;
    } catch (error) {
      this.logger.error(`AWS-S3 - error on send image file`, {
        error: error.message,
      });
      throw new BadRequestException({
        errorCode: ErrorCodes.GENERIC,
        message: 'Erro ao processar o arquivo, tente novamente.',
      });
    }
  }

  public async downloadMedia(path: string): Promise<any> {
    const params = {
      Bucket: this.bucketName,
      Key: path,
    };
  }

  public async downloadMedias(directory: string): Promise<any> {
    const params = {
      Bucket: this.bucketName,
      Prefix: directory,
    };
    return null;
  }

  public async removeMedia(path: string): Promise<any> {
    const params = {
      Bucket: this.bucketName,
      Key: path,
    };

    const deleteObjectData = await this.s3.deleteObject(params);

    return deleteObjectData;
  }

  public async removeMedias(paths: string[]): Promise<any> {
    const objects = paths.map((path) => ({ Key: path }));
    const params = {
      Bucket: this.bucketName,
      Delete: {
        Objects: objects,
      },
    };
  }
}
