import { Body, Controller, Get, Post, Query } from '@nestjs/common';
import { LanguageCreateDTO } from './dto/language-create.dto';
import { LanguageService } from './language.service';
import { Public } from '../../shared/decorators';

@Controller('language')
export class LanguageController {
  constructor(private readonly languageService: LanguageService) {}

  @Public()
  @Get()
  getAll(@Query() params) {
    return this.languageService.findAll(params);
  }

  @Post()
  createLanguage(@Body() data: LanguageCreateDTO) {
    return this.languageService.createLanguage([data]);
  }
}
