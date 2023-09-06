import { Module, forwardRef } from '@nestjs/common';
import { LoggerModule } from '@modules/logger/logger.module';
import { EmployeeModule } from '@modules/employee/employee.module';
import { UserModule } from '../../modules/user/user.module';
import { PushStartController } from './push-start.controller';
import { PushStartService } from './push-start.service';
import { MongooseModule } from '@nestjs/mongoose';
import {
  JobStep,
  JobStepSchema,
  PsTestResult,
  PsTestResultSchema,
} from '@schemas';
import { JobModule } from '@modules/job/job.module';

@Module({
  imports: [
    LoggerModule,
    forwardRef(() => EmployeeModule),
    forwardRef(() => JobModule),
    UserModule,
    MongooseModule.forFeature([{ name: JobStep.name, schema: JobStepSchema }]),
    MongooseModule.forFeature([
      { name: PsTestResult.name, schema: PsTestResultSchema },
    ]),
  ],
  controllers: [PushStartController],
  providers: [PushStartService],
  exports: [PushStartService],
})
export class PushStartModule {}
