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

  @Get(':id/commentary')
  @HttpCode(HttpStatus.OK)
  async getCommentary(@Param('id') id: string) {
    return this.appMatchesService.getCommentary(id);
  }

  @Get(':id/live-status')
  @HttpCode(HttpStatus.OK)
  async getLiveStatus(@Param('id') id: string) {
    return this.appMatchesService.getLiveStatus(id);
  }

  @Get(':id/scorecard/:inning')
  @HttpCode(HttpStatus.OK)
  async getScorecard(@Param('id') id: string, @Param('inning') inning: string) {
    return this.appMatchesService.getScorecard(id, parseInt(inning));
  }

  @Get(':id/squads')
  @HttpCode(HttpStatus.OK)
  async getSquads(@Param('id') id: string) {
    return this.appMatchesService.getSquads(id);
  }

  @Get(':id/sessions')
  @HttpCode(HttpStatus.OK)
  async getSessions(@Param('id') id: string) {
    return this.appMatchesService.getSessions(id);
  }

  @Get(':id/partnerships')
  @HttpCode(HttpStatus.OK)
  async getPartnerships(@Param('id') id: string, @Query('inningNumber') inning: string) {
    return this.appMatchesService.getPartnerships(id, parseInt(inning || '1'));
  }

  @Get(':id/recent-overs')
  @HttpCode(HttpStatus.OK)
  async getRecentOvers(@Param('id') id: string, @Query('inningNumber') inning: string) {
    return this.appMatchesService.getRecentOvers(id, parseInt(inning || '1'));
  }

  @Get(':id/analytics')
  @HttpCode(HttpStatus.OK)
  async getAnalytics(@Param('id') id: string) {
    return this.appMatchesService.getAnalytics(id);
  }
}
