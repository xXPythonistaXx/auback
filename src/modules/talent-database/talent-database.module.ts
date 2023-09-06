import { Module } from '@nestjs/common';
import { EmployeeModule } from '../employee/employee.module';
import { TalentDatabaseController } from './talent-database.controller';
import { TalentDatabaseService } from './talent-database.service';

@Module({
  imports: [EmployeeModule],
  controllers: [TalentDatabaseController],
  providers: [TalentDatabaseService],
})
export class TalentDatabaseModule {}
