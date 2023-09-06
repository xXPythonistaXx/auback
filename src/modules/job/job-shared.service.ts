import { Injectable } from '@nestjs/common';
import { JobService } from './job.service';
import { EmployeeService } from '../employee/employee.service';
import { EmployerService } from '../employer/employer.service';

@Injectable()
export class JobSharedService {
  constructor(
    private readonly jobService: JobService,
    private readonly employeeService: EmployeeService,
    private readonly employerService: EmployerService,
  ) {}

  getJobService(): JobService {
    return this.jobService;
  }

  getEmployeeService(): EmployeeService {
    return this.employeeService;
  }

  getEmployerService(): EmployerService {
    return this.employerService;
  }
}
