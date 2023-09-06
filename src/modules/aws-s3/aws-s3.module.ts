import { Global, Module } from '@nestjs/common';
import { AwsS3Service } from './aws-s3.service';
import { LoggerModule } from '@modules/logger/logger.module';

@Global()
@Module({
  imports: [LoggerModule],
  providers: [AwsS3Service],
  exports: [AwsS3Service],
})
export class AwsS3Module {}
