import { Model, Aggregate, Document } from 'mongoose';
import { PaginateOptions } from './search-query.interface';

export interface AggregatePaginateResult<T> {
  docs: T[];
  totalDocs: number;
  limit: number;
  page?: number;
  totalPages: number;
  nextPage?: number | null;
  prevPage?: number | null;
  pagingCounter: number;
  hasPrevPage: boolean;
  hasNextPage: boolean;
  // meta?: any;
  // [customLabel: string]: T[] | number | boolean | null | undefined;
}
export interface AggregatePaginateModel<T extends Document> extends Model<T> {
  aggregatePaginate(
    query?: Aggregate<T | T[]>,
    options?: PaginateOptions,
    callback?: (err: any, result: AggregatePaginateResult<T>) => void,
  ): Promise<AggregatePaginateResult<T>>;
}
