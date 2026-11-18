import { Controller, Get, Param, Query, HttpCode, HttpStatus } from '@nestjs/common';
import { AppSeriesService } from '../../services/app/series.service';

@Controller('app/series')
export class AppSeriesController {
  constructor(private readonly appSeriesService: AppSeriesService) {}

  @Get()
  @HttpCode(HttpStatus.OK)
  async findAll(@Query() query: any) {
    return this.appSeriesService.findAll(query);
  }

  @Get(':id')
  @HttpCode(HttpStatus.OK)
  async findOne(@Param('id') id: string) {
    return this.appSeriesService.findOne(id);
  }

  @Get(':id/teams')
  @HttpCode(HttpStatus.OK)
  async getTeams(@Param('id') id: string, @Query() query: any) {
    return this.appSeriesService.getTeams(id, query);
  }

  @Get(':id/venues')
  @HttpCode(HttpStatus.OK)
  async getVenues(@Param('id') id: string, @Query() query: any) {
    return this.appSeriesService.getVenues(id, query);
  }

  @Get(':id/teams/:teamId/squad')
  @HttpCode(HttpStatus.OK)
  async getSquad(
    @Param('id') id: string,
    @Param('teamId') teamId: string,
    @Query() query: any,
  ) {
    return this.appSeriesService.getSquad(id, teamId, query);
  }
  @Get(':id/leaders')
  @HttpCode(HttpStatus.OK)
  async getLeaders(@Param('id') id: string) {
    return this.appSeriesService.getLeaders(id);
  }
}
