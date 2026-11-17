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
    return this.mainApp.send('ranking.findAll', q);
  }
}
