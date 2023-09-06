import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { Employee, EmployeeSchema, Job, JobSchema } from '@schemas';
import { FacebookAuthModule } from 'facebook-auth-nestjs';
import { GoogleAuthenticationService } from '../auth/google.service';
import { AuthorizationModule } from '../authorization/authorization.module';
import { MailModule } from '../mail/mail.module';
import { UserModule } from '../user/user.module';
import { EmployeeController } from './employee.controller';
import { EmployeeService } from './employee.service';
import { EventsModule } from '../events/events.module';
import { LoggerModule } from '../logger/logger.module';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Employee.name, schema: EmployeeSchema },
      { name: Job.name, schema: JobSchema },
    ]),
    UserModule,
    FacebookAuthModule,
    MailModule,
    AuthorizationModule,
    EventsModule,
    LoggerModule,
  ],
  controllers: [EmployeeController],
  providers: [EmployeeService, GoogleAuthenticationService],
  exports: [EmployeeService],
})
export class EmployeeModule {}
