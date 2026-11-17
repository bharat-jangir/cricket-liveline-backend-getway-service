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
}
