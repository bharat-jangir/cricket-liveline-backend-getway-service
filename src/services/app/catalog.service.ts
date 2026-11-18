import { Injectable } from '@nestjs/common';
import { MainAppService } from '../main-app.service';

const OBJECT_ID = /^[0-9a-fA-F]{24}$/;

/** Public, read-only catalogue data for the website: series, points tables, rankings. */
@Injectable()
export class AppCatalogService {
  constructor(private readonly mainApp: MainAppService) {}

  private pick(query: any, keys: string[]) {
    const out: any = {};
    for (const k of keys) if (query?.[k] !== undefined && query[k] !== '') out[k] = query[k];
    return out;
  }

  async listSeries(raw: any) {
    const q = this.pick(raw, ['search', 'format', 'status', 'gender', 'seriesType', 'year', 'onHome', 'isFeatured', 'page', 'limit']);
    q.limit = Math.min(parseInt(q.limit) || 30, 100);
    q.page = Math.max(parseInt(q.page) || 1, 1);
    const result = await this.mainApp.send('series.findAll', q);
    if (result?.data && Array.isArray(result.data.result)) {
      result.data.result = result.data.result.filter((s: any) => !s?.dontShowOnApp && s?.isActive !== false);
    }
    return result;
  }

  async getSeries(id: string) {
    return this.mainApp.send('series.findOne', id);
  }

  async getPointsTable(seriesId: string, raw: any) {
    if (!OBJECT_ID.test(seriesId)) return { status: false, statusCode: 400, userMessage: 'Invalid series id', data: null };
    const q: any = { seriesId, limit: 200, ...this.pick(raw, ['matchFormat', 'groupName']) };
    return this.mainApp.send('points-tables.findAll', q);
  }

  async listRankings(raw: any) {
    const q = this.pick(raw, ['type', 'gender', 'format', 'role', 'search', 'page', 'limit']);
    q.limit = Math.min(parseInt(q.limit) || 25, 100);
    q.page = Math.max(parseInt(q.page) || 1, 1);
    const res = await this.mainApp.send('ranking.findAll', q);
    // main-app wraps as data.result = { result: [...], pagination }; the apps expect data.result = [...]
    const inner = res?.data?.result;
    if (inner && !Array.isArray(inner) && Array.isArray(inner.result)) {
      return { ...res, data: { result: inner.result, pagination: inner.pagination } };
    }
    return res;
  }

  // ----- series sub-resources (teams, venues, squads, leaders) -----
  private validId(id: string) {
    return OBJECT_ID.test(id);
  }
  private bad(msg: string) {
    return { status: false, statusCode: 400, userMessage: msg, data: null };
  }

  async seriesTeams(seriesId: string) {
    if (!this.validId(seriesId)) return this.bad('Invalid series id');
    return this.mainApp.send('series-teams.getTeams', { seriesId, query: { limit: 100, page: 1 } });
  }

  async seriesVenues(seriesId: string) {
    if (!this.validId(seriesId)) return this.bad('Invalid series id');
    return this.mainApp.send('series-venues.findAll', { seriesId, query: {} });
  }

  async seriesSquad(seriesId: string, teamId: string, format?: string) {
    if (!this.validId(seriesId) || !this.validId(teamId)) return this.bad('Invalid id');
    return this.mainApp.send('series-teams.getSquad', { seriesId, teamId, format });
  }

  async seriesLeaders(seriesId: string) {
    if (!this.validId(seriesId)) return this.bad('Invalid series id');
    return this.mainApp.send('series.leaders', seriesId);
  }

  // ----- venues -----
  async listVenues(raw: any) {
    const q = this.pick(raw, ['search', 'country', 'city', 'page', 'limit']);
    q.limit = Math.min(parseInt(q.limit) || 20, 100);
    q.page = Math.max(parseInt(q.page) || 1, 1);
    return this.mainApp.send('venues.findAll', q);
  }
  async getVenue(id: string) {
    if (!this.validId(id)) return this.bad('Invalid venue id');
    return this.mainApp.send('venues.findOne', id);
  }
  async venueStats(id: string) {
    if (!this.validId(id)) return this.bad('Invalid venue id');
    return this.mainApp.send('venue-stats.get', id);
  }

  // ----- players -----
  async listPlayers(raw: any) {
    const q = this.pick(raw, ['search', 'country', 'role', 'teamId', 'page', 'limit']);
    q.limit = Math.min(parseInt(q.limit) || 20, 100);
    q.page = Math.max(parseInt(q.page) || 1, 1);
    q.isActive = true;
    return this.mainApp.send('players.findAll', q);
  }
  async getPlayer(id: string) {
    if (!this.validId(id)) return this.bad('Invalid player id');
    return this.mainApp.send('players.findOne', id);
  }
  async playerStats(id: string, format?: string) {
    if (!this.validId(id)) return this.bad('Invalid player id');
    return this.mainApp.send('players.stats', { playerId: id, format });
  }

  // ----- search across everything -----
  async search(raw: any) {
    const term = String(raw?.q || '').trim().slice(0, 60);
    if (term.length < 2) return { status: true, statusCode: 200, data: { result: { matches: [], series: [], players: [], venues: [] } } };
    const take = (p: Promise<any>) => p.then((r) => (Array.isArray(r?.data?.result) ? r.data.result : [])).catch(() => []);
    const [matches, series, players, venues] = await Promise.all([
      take(this.mainApp.send('matches.findAll', { search: term, limit: 5, page: 1 })),
      take(this.mainApp.send('series.findAll', { search: term, limit: 5, page: 1 })),
      take(this.mainApp.send('players.findAll', { search: term, limit: 5, page: 1, isActive: true })),
      take(this.mainApp.send('venues.findAll', { search: term, limit: 5, page: 1 })),
    ]);
    return { status: true, statusCode: 200, data: { result: { matches: matches.filter((m: any) => !m?.isNotShowing), series, players, venues } } };
  }
}
