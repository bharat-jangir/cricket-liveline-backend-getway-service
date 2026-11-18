import { Body, Controller, Delete, Get, HttpCode, HttpStatus, Param, Patch, Post, Query, Req } from '@nestjs/common';
import { MainAppService } from '../../services/main-app.service';
import { CONTENT_ROLES, requireRole } from '../../auth/roles';
import { CreateArticleDto, CreateShortDto, UpdateArticleDto, UpdateShortDto } from '../../dto/admin/content.dto';

/** Editorial CMS: news articles. Requires an authenticated content role (global AuthGuard + role check). */
@Controller('admin/news')
export class AdminNewsController {
  constructor(private readonly mainApp: MainAppService) {}

  @Get()
  list(@Req() req: any, @Query() q: any) {
    requireRole(req, CONTENT_ROLES);
    return this.mainApp.sendOrThrow('news.adminList', { status: q.status, category: q.category, search: q.search, page: q.page, limit: q.limit });
  }

  @Get(':id')
  get(@Req() req: any, @Param('id') id: string) {
    requireRole(req, CONTENT_ROLES);
    return this.mainApp.sendOrThrow('news.adminGet', id);
  }

  @Post()
  @HttpCode(HttpStatus.CREATED)
  create(@Req() req: any, @Body() dto: CreateArticleDto) {
    requireRole(req, CONTENT_ROLES);
    return this.mainApp.sendOrThrow('news.create', { dto, author: { id: req.user.id, name: req.user.name } });
  }

  @Patch(':id')
  update(@Req() req: any, @Param('id') id: string, @Body() dto: UpdateArticleDto) {
    requireRole(req, CONTENT_ROLES);
    return this.mainApp.sendOrThrow('news.update', { id, dto });
  }

  @Delete(':id')
  remove(@Req() req: any, @Param('id') id: string) {
    requireRole(req, CONTENT_ROLES);
    return this.mainApp.sendOrThrow('news.remove', id);
  }
}

@Controller('admin/shorts')
export class AdminShortsController {
  constructor(private readonly mainApp: MainAppService) {}

  @Get()
  list(@Req() req: any, @Query() q: any) {
    requireRole(req, CONTENT_ROLES);
    return this.mainApp.sendOrThrow('shorts.adminList', { status: q.status, search: q.search, page: q.page, limit: q.limit });
  }

  @Post()
  @HttpCode(HttpStatus.CREATED)
  create(@Req() req: any, @Body() dto: CreateShortDto) {
    requireRole(req, CONTENT_ROLES);
    return this.mainApp.sendOrThrow('shorts.create', { dto, author: { id: req.user.id } });
  }

  @Patch(':id')
  update(@Req() req: any, @Param('id') id: string, @Body() dto: UpdateShortDto) {
    requireRole(req, CONTENT_ROLES);
    return this.mainApp.sendOrThrow('shorts.update', { id, dto });
  }

  @Delete(':id')
  remove(@Req() req: any, @Param('id') id: string) {
    requireRole(req, CONTENT_ROLES);
    return this.mainApp.sendOrThrow('shorts.remove', id);
  }
}
