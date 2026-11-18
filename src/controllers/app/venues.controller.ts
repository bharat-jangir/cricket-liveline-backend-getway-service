import {
  Controller,
  Get,
  Param,
  Query,
  HttpCode,
  HttpStatus,
  Logger,
} from '@nestjs/common';
import { MainAppService } from '../../services/main-app.service';

@Controller('app/venues')
export class AppVenuesController {
  private readonly logger = new Logger(AppVenuesController.name);

  constructor(private mainAppService: MainAppService) {}

  @Get()
  async findAll(@Query() query: any) {
    this.logger.debug('Fetching venues for app');
    const result = await this.mainAppService.send('venues.findAll', query);
    return result;
  }

  @Get(':id')
  async findOne(@Param('id') id: string) {
    this.logger.debug(`Fetching venue details for app: ${id}`);
    const result = await this.mainAppService.send('venues.findOne', id);
    return result;
  }

  @Get(':id/stats')
  async getStats(@Param('id') id: string) {
    this.logger.debug(`Fetching venue stats for app: ${id}`);
    const result = await this.mainAppService.send('venue-stats.get', id);
    return result;
  }
}
