import { Controller, Get } from '@nestjs/common';
import { LanguagesService } from './languages.service';

@Controller('languages')
export class LanguagesPublicController {
  constructor(private readonly languagesService: LanguagesService) {}

  @Get()
  findActive() {
    return this.languagesService.findActive();
  }

  @Get('default')
  findDefault() {
    return this.languagesService.findDefault();
  }
}
