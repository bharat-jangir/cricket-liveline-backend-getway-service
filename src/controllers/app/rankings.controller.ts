import { Controller, Get, Query, HttpCode, HttpStatus } from '@nestjs/common';
import { MainAppService } from '../../services/main-app.service';

@Controller('app/rankings')
export class AppRankingsController {
  constructor(private readonly mainAppService: MainAppService) {}

  @Get()
  @HttpCode(HttpStatus.OK)
  async getRankings(@Query() query: any) {
    return this.mainAppService.send('ranking.findAll', query);
  }
}
