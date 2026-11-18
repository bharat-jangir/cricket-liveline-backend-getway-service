import { Body, Controller, Get, HttpCode, HttpException, HttpStatus, Param, Post, Query, Req } from '@nestjs/common';
import { MainAppService } from '../../services/main-app.service';
import { Public } from '../../auth/public.decorator';
import { LikeDto } from '../../dto/admin/content.dto';

/** Tiny in-memory sliding-window limiter (per gateway instance) to blunt like/view spam. */
class Limiter {
  private hits = new Map<string, number[]>();
  allow(key: string, max: number, windowMs: number) {
    const now = Date.now();
    const arr = (this.hits.get(key) || []).filter((t) => now - t < windowMs);
    if (arr.length >= max) { this.hits.set(key, arr); return false; }
    arr.push(now);
    this.hits.set(key, arr);
    if (this.hits.size > 5000) this.hits.clear(); // bound memory
    return true;
  }
}

@Public()
@Controller('app')
export class AppContentController {
  private readonly limiter = new Limiter();
  constructor(private readonly mainApp: MainAppService) {}

  @Get('news')
  @HttpCode(HttpStatus.OK)
  news(@Query() q: any) {
    return this.mainApp.sendOrThrow('news.publicList', { page: q.page, limit: q.limit, category: q.category, featured: q.featured, seriesId: q.seriesId, matchId: q.matchId });
  }

  @Get('news/:idOrSlug')
  @HttpCode(HttpStatus.OK)
  article(@Param('idOrSlug') idOrSlug: string, @Req() req: any) {
    // Count a view at most once per IP per article per hour (refreshes don't inflate it)
    const countView = this.limiter.allow(`view:${req.ip || 'unknown'}:${idOrSlug}`, 1, 60 * 60 * 1000);
    return this.mainApp.sendOrThrow('news.publicGet', { idOrSlug, countView });
  }

  @Get('shorts')
  @HttpCode(HttpStatus.OK)
  shorts(@Query() q: any) {
    return this.mainApp.sendOrThrow('shorts.publicList', { page: q.page, limit: q.limit });
  }

  @Post('shorts/:id/view')
  @HttpCode(HttpStatus.OK)
  view(@Param('id') id: string, @Req() req: any) {
    if (!this.limiter.allow(`sv:${req.ip}:${id}`, 1, 10 * 60 * 1000)) return { status: true, statusCode: 200, data: { result: { ok: true } } };
    return this.mainApp.sendOrThrow('shorts.view', id);
  }

  @Post('shorts/:id/like')
  @HttpCode(HttpStatus.OK)
  like(@Param('id') id: string, @Body() dto: LikeDto, @Req() req: any) {
    const ip = req.ip || 'unknown';
    if (!this.limiter.allow(`like:${ip}`, 60, 60 * 60 * 1000)) throw new HttpException('Too many requests', HttpStatus.TOO_MANY_REQUESTS);
    return this.mainApp.sendOrThrow('shorts.like', { id, like: dto.like });
  }
}
