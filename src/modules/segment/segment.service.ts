import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Segment, SegmentDocument } from '@schemas';
import {
  defaultPaginateOptions,
  ISegmentCreate,
  PaginateOptions,
} from '@shared/interfaces';
import { PaginateModel } from 'mongoose';

@Injectable()
export class SegmentService {
  constructor(
    @InjectModel(Segment.name)
    private segmentModel: PaginateModel<SegmentDocument>,
  ) {}

  findAll(params?: PaginateOptions) {
    const { q, ...paginateOptions } = params;
    const options = { ...defaultPaginateOptions, ...paginateOptions };
    const search = q ? { name: { $regex: new RegExp(q, 'i') } } : {};
    return this.segmentModel.paginate(search, options);
  }

  async createSegment(segments: ISegmentCreate[]) {
    return this.segmentModel.insertMany(segments);
  }
}
