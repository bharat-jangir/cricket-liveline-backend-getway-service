import {
  Controller,
  Get,
  Put,
  Body,
  Param,
  HttpCode,
  HttpStatus,
  Logger,
} from '@nestjs/common';
import { UpsertVenueStatsDto } from '../../dto/admin/venue-stats.dto';
import { MainAppService } from '../../services/main-app.service';

@Controller('admin/venues/:venueId/stats')
export class AdminVenueStatsController {
  private readonly logger = new Logger(AdminVenueStatsController.name);

  constructor(private mainAppService: MainAppService) {}

  @Get()
  @HttpCode(HttpStatus.OK)
  async getStats(@Param('venueId') venueId: string) {
    this.logger.debug(`Getting stats for venue: ${venueId}`);
    const result = await this.mainAppService.send('venue-stats.get', venueId);
    return result;
  }

  @Put()
  @HttpCode(HttpStatus.OK)
  async upsertStats(
    @Param('venueId') venueId: string,
    @Body() dto: UpsertVenueStatsDto,
  ) {
    this.logger.debug(`Upserting stats for venue: ${venueId}`);
    const result = await this.mainAppService.send('venue-stats.upsert', {
      venueId,
      dto,
    });
    return result;
  }
}

