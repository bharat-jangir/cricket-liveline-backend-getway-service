import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  Query,
  ValidationPipe,
  UsePipes,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { MainAppService } from '../../services/main-app.service';
import { AddTeamToSeriesDto, UpdateSquadDto } from '../../dto/admin/series-teams.dto';

@Controller('admin/series/:seriesId/teams')
export class AdminSeriesTeamsController {
  constructor(private readonly mainAppService: MainAppService) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  @UsePipes(new ValidationPipe({ transform: true }))
  async addTeam(
    @Param('seriesId') seriesId: string,
    @Body() addTeamDto: AddTeamToSeriesDto,
  ) {
    const result = await this.mainAppService.send('series-teams.addTeam', {
      seriesId,
      addTeamDto,
    });

    if (result && typeof result === 'object' && 'status' in result && 'data' in result) {
      return result;
    }

    return {
      statusCode: HttpStatus.CREATED,
      status: true,
      userMessage: 'Team added to series successfully',
      userMessageCode: 'TEAM_ADDED',
      developerMessage: 'Team added to series successfully',
      data: result || {},
    };
  }

  @Get()
  @HttpCode(HttpStatus.OK)
  @UsePipes(new ValidationPipe({ transform: true }))
  async getTeams(
    @Param('seriesId') seriesId: string,
    @Query('format') format?: string,
    @Query('groupName') groupName?: string,
  ) {
    const result = await this.mainAppService.send('series-teams.getTeams', {
      seriesId,
      query: { format, groupName },
    });

    if (result && typeof result === 'object' && 'status' in result && 'data' in result) {
      return result;
    }

    return {
      statusCode: HttpStatus.OK,
      status: true,
      userMessage: 'Teams retrieved successfully',
      userMessageCode: 'TEAMS_RETRIEVED',
      developerMessage: 'Teams retrieved successfully',
      data: result || {},
    };
  }

  @Get(':teamId/squad')
  @HttpCode(HttpStatus.OK)
  @UsePipes(new ValidationPipe({ transform: true }))
  async getSquad(
    @Param('seriesId') seriesId: string,
    @Param('teamId') teamId: string,
    @Query('format') format: string,
  ) {
    const result = await this.mainAppService.send('series-teams.getSquad', {
      seriesId,
      teamId,
      format,
    });

    if (result && typeof result === 'object' && 'status' in result && 'data' in result) {
      return result;
    }

    return {
      statusCode: HttpStatus.OK,
      status: true,
      userMessage: 'Squad retrieved successfully',
      userMessageCode: 'SQUAD_RETRIEVED',
      developerMessage: 'Squad retrieved successfully',
      data: result || {},
    };
  }

  @Put(':teamId/squad')
  @HttpCode(HttpStatus.OK)
  @UsePipes(new ValidationPipe({ transform: true }))
  async updateSquad(
    @Param('seriesId') seriesId: string,
    @Param('teamId') teamId: string,
    @Query('format') format: string,
    @Body() updateSquadDto: UpdateSquadDto,
  ) {
    const result = await this.mainAppService.send('series-teams.updateSquad', {
      seriesId,
      teamId,
      format,
      updateSquadDto,
    });

    if (result && typeof result === 'object' && 'status' in result && 'data' in result) {
      return result;
    }

    return {
      statusCode: HttpStatus.OK,
      status: true,
      userMessage: 'Squad updated successfully',
      userMessageCode: 'SQUAD_UPDATED',
      developerMessage: 'Squad updated successfully',
      data: result || {},
    };
  }

  @Delete(':teamId')
  @HttpCode(HttpStatus.OK)
  @UsePipes(new ValidationPipe({ transform: true }))
  async removeTeam(
    @Param('seriesId') seriesId: string,
    @Param('teamId') teamId: string,
    @Query('format') format: string,
  ) {
    const result = await this.mainAppService.send('series-teams.removeTeam', {
      seriesId,
      teamId,
      format,
    });

    if (result && typeof result === 'object' && 'status' in result && 'data' in result) {
      return result;
    }

    return {
      statusCode: HttpStatus.OK,
      status: true,
      userMessage: 'Team removed successfully',
      userMessageCode: 'TEAM_REMOVED',
      developerMessage: 'Team removed successfully',
      data: result || {},
    };
  }
}

