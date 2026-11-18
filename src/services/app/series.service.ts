import { Injectable, Logger } from '@nestjs/common';
import { MainAppService } from '../main-app.service';

@Injectable()
export class AppSeriesService {
  private readonly logger = new Logger(AppSeriesService.name);

  constructor(private readonly mainAppService: MainAppService) {}

  async findAll(query: any) {
    this.logger.debug(`[findAll] Fetching series with query: ${JSON.stringify(query)}`);
    const result = await this.mainAppService.send('series.findAll', query);
    return result;
  }

  async findOne(id: string) {
    this.logger.debug(`[findOne] Fetching series with id: ${id}`);
    const result = await this.mainAppService.send('series.findOne', id);
    return result;
  }

  async getTeams(seriesId: string, query: any = {}) {
    this.logger.debug(`[getTeams] Fetching teams for series: ${seriesId}`);
    const result = await this.mainAppService.send('series-teams.getTeams', { seriesId, query });
    return result;
  }

  async getVenues(seriesId: string, query: any = {}) {
    this.logger.debug(`[getVenues] Fetching venues for series: ${seriesId}`);
    const result = await this.mainAppService.send('series-venues.findAll', { seriesId, query });
    return result;
  }

  async getSquad(seriesId: string, teamId: string, query: any = {}) {
    this.logger.debug(`[getSquad] Fetching squad for series: ${seriesId}, team: ${teamId}`);
    const result = await this.mainAppService.send('series-teams.getSquad', { seriesId, teamId, ...query });
    return result;
  }

  async getLeaders(seriesId: string) {
    this.logger.debug(`[getLeaders] Fetching leaders for series: ${seriesId}`);
    const result = await this.mainAppService.send('fantasy-stats.getSeriesLeaders', seriesId);
    return result;
  }
}
