import { Controller, Get, HttpCode, HttpStatus, Param, Query } from '@nestjs/common';
import { Public } from '../../auth/public.decorator';
import { AppCatalogService } from '../../services/app/catalog.service';

@Public()
@Controller('app')
export class AppCatalogController {
  constructor(private readonly catalog: AppCatalogService) {}

  @Get('series')
  @HttpCode(HttpStatus.OK)
  listSeries(@Query() query: any) {
    return this.catalog.listSeries(query);
  }

  @Get('series/:id')
  @HttpCode(HttpStatus.OK)
  getSeries(@Param('id') id: string) {
    return this.catalog.getSeries(id);
  }

  @Get('series/:id/points-table')
  @HttpCode(HttpStatus.OK)
  getPointsTable(@Param('id') id: string, @Query() query: any) {
    return this.catalog.getPointsTable(id, query);
  }

  @Get('rankings')
  @HttpCode(HttpStatus.OK)
  listRankings(@Query() query: any) {
    return this.catalog.listRankings(query);
  }

  // ----- series sub-resources -----
  @Get('series/:id/teams')
  @HttpCode(HttpStatus.OK)
  seriesTeams(@Param('id') id: string) {
    return this.catalog.seriesTeams(id);
  }

  @Get('series/:id/venues')
  @HttpCode(HttpStatus.OK)
  seriesVenues(@Param('id') id: string) {
    return this.catalog.seriesVenues(id);
  }

  @Get('series/:id/teams/:teamId/squad')
  @HttpCode(HttpStatus.OK)
  seriesSquad(@Param('id') id: string, @Param('teamId') teamId: string, @Query('format') format?: string) {
    return this.catalog.seriesSquad(id, teamId, format);
  }

  @Get('series/:id/leaders')
  @HttpCode(HttpStatus.OK)
  seriesLeaders(@Param('id') id: string) {
    return this.catalog.seriesLeaders(id);
  }

  // ----- venues -----
  @Get('venues')
  @HttpCode(HttpStatus.OK)
  listVenues(@Query() query: any) {
    return this.catalog.listVenues(query);
  }

  @Get('venues/:id')
  @HttpCode(HttpStatus.OK)
  getVenue(@Param('id') id: string) {
    return this.catalog.getVenue(id);
  }

  @Get('venues/:id/stats')
  @HttpCode(HttpStatus.OK)
  venueStats(@Param('id') id: string) {
    return this.catalog.venueStats(id);
  }

  // ----- players -----
  @Get('players')
  @HttpCode(HttpStatus.OK)
  listPlayers(@Query() query: any) {
    return this.catalog.listPlayers(query);
  }

  @Get('players/:id')
  @HttpCode(HttpStatus.OK)
  getPlayer(@Param('id') id: string) {
    return this.catalog.getPlayer(id);
  }

  @Get('players/:id/stats')
  @HttpCode(HttpStatus.OK)
  playerStats(@Param('id') id: string, @Query('format') format?: string) {
    return this.catalog.playerStats(id, format);
  }

  // ----- search -----
  @Get('search')
  @HttpCode(HttpStatus.OK)
  search(@Query() query: any) {
    return this.catalog.search(query);
  }
}
