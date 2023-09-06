import { Module, forwardRef } from '@nestjs/common';
import { LearnWorldsService } from './learn-worlds.service';
import { LearnWorldsController } from './learn-worlds.controller';
import { LoggerModule } from '@modules/logger/logger.module';
import { EmployeeModule } from '@modules/employee/employee.module';
import { UserModule } from '../../modules/user/user.module';

@Module({
  imports: [LoggerModule, forwardRef(() => EmployeeModule), UserModule],
  controllers: [LearnWorldsController],
  providers: [LearnWorldsService],
  exports: [LearnWorldsService],
})
export class LearnWorldsModule {}
