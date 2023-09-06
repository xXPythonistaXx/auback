import { PaginateOptions as Options, FilterQuery } from 'mongoose';

export type SearchOptions<T = unknown> = {
  q?: string;
  filterQuery?: FilterQuery<T>;
};

export interface PaginateOptions<T = unknown>
  extends Options,
    SearchOptions<T> {
  page?: number;
  limit?: number;
}

export const defaultPaginateOptions: PaginateOptions = {
  page: 1,
  limit: 5,

  // customLabels: { docs: 'data', totalDocs: 'total' },
};
