import { Module, forwardRef } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import {
  Job,
  JobSchema,
  JobStep,
  JobStepSchema,
  MacroJob,
  MacroJobSchema,
} from '@schemas';
import { EmployeeModule } from '../employee/employee.module';
import { EmployerModule } from '../employer/employer.module';
import { MailModule } from '../mail/mail.module';
import { JobController } from './job.controller';
import { JobService } from './job.service';
import { LoggerModule } from '@modules/logger/logger.module';
import { PushStartModule } from '@libs/push-start/push-start.module';
import { CourseModule } from '@modules/course/course.module';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Job.name, schema: JobSchema },
      { name: JobStep.name, schema: JobStepSchema },
      { name: MacroJob.name, schema: MacroJobSchema },
    ]),
    forwardRef(() => EmployeeModule),
    EmployerModule,
    MailModule,
    LoggerModule,
    forwardRef(() => PushStartModule),
    CourseModule,
  ],
  providers: [JobService],
  controllers: [JobController],
  exports: [JobService],
})
export class JobModule {}
