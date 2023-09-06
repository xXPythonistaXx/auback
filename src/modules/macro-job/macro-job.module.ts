import { Module } from '@nestjs/common';
import { MacroJobService } from './macro-job.service';
import { MacroJobController } from './macro-job.controller';
import { MongooseModule } from '@nestjs/mongoose';
import { Job, JobSchema, MacroJob, MacroJobSchema } from '@schemas';
import { EmployerModule } from '@modules/employer/employer.module';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: MacroJob.name, schema: MacroJobSchema },
      { name: Job.name, schema: JobSchema },
    ]),
    EmployerModule,
  ],
  controllers: [MacroJobController],
  providers: [MacroJobService],
})
export class MacroJobModule {}
