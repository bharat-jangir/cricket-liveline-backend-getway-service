import { Controller, Get, Param, Query, Logger } from '@nestjs/common';
import { GatewayService } from '../../gateway.service';

@Controller('players')
export class AppPlayersController {
  private readonly logger = new Logger(AppPlayersController.name);

  constructor(private readonly gatewayService: GatewayService) {}

  @Get()
  async findAll(@Query() query: any) {
    this.logger.log(`Fetching all players with query: ${JSON.stringify(query)}`);
    return this.gatewayService.proxyRequest({
      method: 'GET',
      path: '/api/players',
      query,
    } as any);
  }

  @Get(':id')
  async findOne(@Param('id') id: string) {
    this.logger.log(`Fetching player details for ID: ${id}`);
    return this.gatewayService.proxyRequest({
      method: 'GET',
      path: `/api/players/${id}`,
    } as any);
  }

  @Get(':id/stats')
  async getPlayerStats(@Param('id') id: string, @Query('format') format: string) {
    this.logger.log(`Fetching player stats for ID: ${id}, format: ${format}`);
    return this.gatewayService.proxyRequest({
      method: 'GET',
      path: `/api/players/${id}/stats`,
      query: { format },
    } as any);
  }
}
