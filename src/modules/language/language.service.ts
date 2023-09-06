import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Language, LanguageDocument } from '@schemas';
import {
  defaultPaginateOptions,
  ILanguageCreate,
  PaginateOptions,
} from '@shared/interfaces';
import { PaginateModel } from 'mongoose';

@Injectable()
export class LanguageService {
  constructor(
    @InjectModel(Language.name)
    private languageModel: PaginateModel<LanguageDocument>,
  ) {}

  findAll(params?: PaginateOptions) {
    const { q, ...paginateOptions } = params;
    const options = { ...defaultPaginateOptions, ...paginateOptions };
    const search = q ? { name: { $regex: new RegExp(q, 'i') } } : {};
    return this.languageModel.paginate(search, options);
  }

  async createLanguage(languages: ILanguageCreate[]) {
    return this.languageModel.insertMany(languages);
  }
}
