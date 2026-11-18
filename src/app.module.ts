import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { HttpModule } from '@nestjs/axios';
import { APP_INTERCEPTOR, APP_FILTER } from '@nestjs/core';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { GatewayController } from './gateway.controller';
import { GatewayService } from './gateway.service';
import { AdminVenuesController } from './controllers/admin/venues.controller';
import { AdminVenueStatsController } from './controllers/admin/venue-stats.controller';
import { AdminUmpiresController } from './controllers/admin/umpires.controller';
import { AdminTeamsController } from './controllers/admin/teams.controller';
import { AdminSeriesController } from './controllers/admin/series.controller';
import { AdminSeriesTeamsController } from './controllers/admin/series-teams.controller';
import { AdminSeriesVenuesController } from './controllers/admin/series-venues.controller';
import { AdminPlayersController } from './controllers/admin/players.controller';
import { AdminMatchesController } from './controllers/admin/matches.controller';
import { AdminPointsTablesController } from './controllers/admin/points-tables.controller';
import { AdminFantasyStatsController } from './controllers/admin/fantasy-stats.controller';
import { AdminLiveMatchController } from './controllers/admin/live-match.controller';
import { AdminRankingsController } from './controllers/admin/rankings.controller';
import { AppMatchesController } from './controllers/app/matches.controller';
import { AppRankingsController } from './controllers/app/rankings.controller';
import { AppSeriesController } from './controllers/app/series.controller';
import { AppVenuesController } from './controllers/app/venues.controller';
import { AppPlayersController } from './controllers/app/players.controller';
import { AppMatchesService } from './services/app/matches.service';
import { AppSeriesService } from './services/app/series.service';
import { MainAppService } from './services/main-app.service';
import { LoggerService } from './common/services/logger.service';
import { LoggingInterceptor } from './common/interceptors/logging.interceptor';
import { ResponseInterceptor } from './common/interceptors/response.interceptor';
import { HttpExceptionFilter } from './common/filters/http-exception.filter';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env',
    }),
    HttpModule.register({
      timeout: 5000,
      maxRedirects: 5,
    }),
  ],
  // Admin controllers must come before GatewayController (wildcard)
  // to ensure specific routes are matched first
  controllers: [
    AppController,
    AppMatchesController,
    AppRankingsController,
    AppSeriesController,
    AppVenuesController,
    AppPlayersController,
    AdminVenuesController,
    AdminVenueStatsController,
    AdminUmpiresController,
    AdminTeamsController,
    AdminSeriesController,
    AdminSeriesTeamsController,
    AdminSeriesVenuesController,
    AdminPlayersController,
    AdminMatchesController,
    AdminPointsTablesController,
    AdminFantasyStatsController,
    AdminLiveMatchController,
    AdminRankingsController,
    GatewayController,
  ],
  providers: [
    AppService,
    GatewayService,
    MainAppService,
    AppMatchesService,
    AppSeriesService,
    LoggerService,
    // LoggingInterceptor disabled since LogsModule was removed in main-app
    {
      provide: APP_INTERCEPTOR,
      useClass: ResponseInterceptor,
    },
    {
      provide: APP_FILTER,
      useClass: HttpExceptionFilter,
    },
  ],
  exports: [MainAppService, LoggerService],
})
export class AppModule {}

