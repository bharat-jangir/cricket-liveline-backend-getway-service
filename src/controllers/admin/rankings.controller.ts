import { Controller, Get, Post, Put, Delete, Body, Param, Query, HttpCode, HttpStatus } from '@nestjs/common';
import { MainAppService } from '../../services/main-app.service';

@Controller('admin/rankings')
export class AdminRankingsController {
  constructor(private readonly mainAppService: MainAppService) {}

  @Get('findAll')
  @HttpCode(HttpStatus.OK)
  async getAll(@Query() query: any) {
    return this.mainAppService.send('ranking.findAll', query);
  }

  @Post('create')
  @HttpCode(HttpStatus.CREATED)
  async createRanking(@Body() dto: any) {
    return this.mainAppService.send('ranking.create', dto);
  }

  @Get('preview')
  @HttpCode(HttpStatus.OK)
  async preview(@Query() params: any) {
    return this.mainAppService.send('ranking.preview', params);
  }

  @Post('refresh')
  @HttpCode(HttpStatus.OK)
  async refresh(@Body() params: any) {
    return this.mainAppService.send('ranking.refresh', params);
  }

  @Put(':id')
  @HttpCode(HttpStatus.OK)
  async updateRanking(@Param('id') id: string, @Body() dto: any) {
    return this.mainAppService.send('ranking.update', { id, dto });
  }

  @Delete(':id')
  @HttpCode(HttpStatus.OK)
  async removeRanking(@Param('id') id: string) {
    return this.mainAppService.send('ranking.remove', id);
  }
}
