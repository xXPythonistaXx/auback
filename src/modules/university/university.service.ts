import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { University, UniversityDocument } from '@schemas';
import { PaginateOptions, defaultPaginateOptions } from '@shared/interfaces';
import { PaginateModel } from 'mongoose';

@Injectable()
export class UniversityService {
  constructor(
    @InjectModel(University.name)
    private universityModel: PaginateModel<UniversityDocument>,
  ) {}

  findAll(params?: PaginateOptions) {
    const { q, ...paginateOptions } = params;
    const options = { ...defaultPaginateOptions, ...paginateOptions };
    const search = q
      ? {
          $or: [
            { name: { $regex: `(?i)(${q})` } },
            { sigla_da_ies: { $regex: q.toUpperCase() } },
          ],
        }
      : {};

    return this.universityModel.paginate(search, options);
  }
}
