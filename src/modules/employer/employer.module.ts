import { Module, forwardRef } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { Employer, EmployerSchema } from '@schemas';
import { AuthorizationModule } from '../authorization/authorization.module';
import { EmployeeModule } from '../employee/employee.module';
import { MailModule } from '../mail/mail.module';
import { UserModule } from '../user/user.module';
import { EmployerController } from './employer.controller';
import { EmployerService } from './employer.service';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Employer.name, schema: EmployerSchema },
    ]),
    UserModule,
    MailModule,
    AuthorizationModule,
    forwardRef(() => EmployeeModule),
  ],
  controllers: [EmployerController],
  providers: [EmployerService],
  exports: [EmployerService],
})
export class EmployerModule {}
