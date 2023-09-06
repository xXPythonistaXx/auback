import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Tool, ToolDocument } from '@schemas';
import {
  defaultPaginateOptions,
  IToolCreate,
  PaginateOptions,
} from '@shared/interfaces';
import { PaginateModel } from 'mongoose';

@Injectable()
export class ToolService {
  constructor(
    @InjectModel(Tool.name)
    private toolModel: PaginateModel<ToolDocument>,
  ) {}

  findAll(params?: PaginateOptions) {
    const { q, ...paginateOptions } = params;
    const options = { ...defaultPaginateOptions, ...paginateOptions };
    const search = q ? { name: { $regex: new RegExp(q, 'i') } } : {};
    return this.toolModel.paginate(search, options);
  }

  async createTool(tools: IToolCreate[]) {
    return this.toolModel.insertMany(tools);
  }
}
