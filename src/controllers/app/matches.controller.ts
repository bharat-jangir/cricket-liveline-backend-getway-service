import { Controller, Get, Param, Query, HttpCode, HttpStatus } from '@nestjs/common';
import { AppMatchesService } from '../../services/app/matches.service';

@Controller('app/matches')
export class AppMatchesController {
  constructor(private readonly appMatchesService: AppMatchesService) {}

  @Get()
  @HttpCode(HttpStatus.OK)
  async findAll(@Query() query: any) {
    // Using any query dto types that main-app expects
    return this.appMatchesService.findAll(query);
  }

  @Get(':id')
  @HttpCode(HttpStatus.OK)
  async findOne(@Param('id') id: string) {
    return this.appMatchesService.findOne(id);
  }
}
