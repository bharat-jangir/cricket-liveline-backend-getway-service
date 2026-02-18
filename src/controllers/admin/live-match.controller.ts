import {
  Controller,
  Get,
  Put,
  Post,
  Delete,
  Body,
  Param,
  Query,
  ValidationPipe,
  UsePipes,
  HttpCode,
  HttpStatus,
  Logger,
  Patch,
} from '@nestjs/common';
import { MainAppService } from '../../services/main-app.service';
import { UpdateLiveStatusDto } from '../../dto/admin/update-live-status.dto';
import { UpdateBatsmanDto } from '../../dto/admin/update-batsman.dto';
import { UpdateBowlerDto } from '../../dto/admin/update-bowler.dto';
import { UpdateInningDto } from '../../dto/admin/update-inning.dto';
import { UpdateMatchSquadDto } from '../../dto/admin/update-match-squad.dto';
import { SwitchTeamDto } from '../../dto/admin/switch-team.dto';
import { UpdateTossDto } from '../../dto/admin/update-toss.dto';
import { ScoreEventDto } from '../../dto/admin/score-event.dto';
import { SimpleEventDto } from '../../dto/admin/simple-event.dto';
import { StartSuperOverDto } from '../../dto/admin/start-super-over.dto';


@Controller('admin/matches/:matchId')
export class AdminLiveMatchController {
  private readonly logger = new Logger(AdminLiveMatchController.name);

  constructor(private readonly mainAppService: MainAppService) { }

  @Get('match-details')
  @HttpCode(HttpStatus.OK)
  async getMatchDetails(@Param('matchId') matchId: string) {
    try {
      if (!/^[0-9a-fA-F]{24}$/.test(matchId)) {
        return {
          statusCode: HttpStatus.BAD_REQUEST,
          status: false,
          userMessage: 'Invalid match ID format',
          developerMessage: 'Match ID must be a valid MongoDB ObjectId',
          data: null,
        };
      }

      const result = await this.mainAppService.send('live-match.getMatchDetails', matchId);
      return result;
    } catch (error: any) {
      this.logger.error('Error in getMatchDetails', error.stack || error.message || error);
      return {
        statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
        status: false,
        userMessage: 'Failed to fetch match details',
        developerMessage: error?.message || 'Unknown error',
        data: null,
      };
    }
  }

  @Patch('match-details')
  @HttpCode(HttpStatus.OK)
  async updateMatchDetails(@Param('matchId') matchId: string, @Body() updateDto: any) {
    try {
      if (!/^[0-9a-fA-F]{24}$/.test(matchId)) {
        return {
          statusCode: HttpStatus.BAD_REQUEST,
          status: false,
          userMessage: 'Invalid match ID format',
          developerMessage: 'Match ID must be a valid MongoDB ObjectId',
          data: null,
        };
      }

      const result = await this.mainAppService.send('live-match.updateMatchDetails', { matchId, updateDto });
      return result;
    } catch (error: any) {
      this.logger.error('Error in updateMatchDetails', error.stack || error.message || error);
      return {
        statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
        status: false,
        userMessage: 'Failed to update match details',
        developerMessage: error?.message || 'Unknown error',
        data: null,
      };
    }
  }

  // Live Status APIs
  @Get('live-status')
  @HttpCode(HttpStatus.OK)
  async getLiveStatus(@Param('matchId') matchId: string) {
    try {
      // Validate ObjectId format
      if (!/^[0-9a-fA-F]{24}$/.test(matchId)) {
        return {
          statusCode: HttpStatus.BAD_REQUEST,
          status: false,
          userMessage: 'Invalid match ID format',
          userMessageCode: 'INVALID_MATCH_ID',
          developerMessage: 'Match ID must be a valid MongoDB ObjectId',
          data: null,
        };
      }

      const result = await this.mainAppService.send('live-match.getStatus', matchId);
      if (!result) {
        throw new Error('No response from main app service');
      }
      // Return main-app response directly without wrapping
      return result;
    } catch (error: any) {
      this.logger.error('Error in getLiveStatus', error.stack || error.message || error);
      return {
        statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
        status: false,
        userMessage: 'Failed to fetch live status',
        userMessageCode: 'LIVE_STATUS_FETCH_FAILED',
        developerMessage: error?.message || error?.toString() || 'Unknown error',
        data: null,
      };
    }
  }

  @Get('innings')
  @HttpCode(HttpStatus.OK)
  async getInnings(@Param('matchId') matchId: string) {
    try {
      if (!/^[0-9a-fA-F]{24}$/.test(matchId)) {
        return {
          statusCode: HttpStatus.BAD_REQUEST,
          status: false,
          userMessage: 'Invalid match ID format',
          userMessageCode: 'INVALID_MATCH_ID',
          developerMessage: 'Match ID must be a valid MongoDB ObjectId',
          data: null,
        };
      }

      // Get all innings for this match
      console.log(`[Gateway] Fetching innings for matchId: ${matchId}`);
      const result = await this.mainAppService.send('live-match.getAllInnings', matchId);
      console.log(`[Gateway] Received result from main-app:`, JSON.stringify(result).substring(0, 200) + '...');

      if (!result) {
        throw new Error('No response from main app service');
      }

      return result;
    } catch (error: any) {
      this.logger.error('Error in getInnings', error.stack || error.message || error);
      return {
        statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
        status: false,
        userMessage: 'Failed to fetch innings',
        userMessageCode: 'INNINGS_FETCH_FAILED',
        developerMessage: error?.message || error?.toString() || 'Unknown error',
        data: null,
      };
    }
  }

  @Put('live-status')
  @HttpCode(HttpStatus.OK)
  @UsePipes(new ValidationPipe({ transform: true }))
  async updateLiveStatus(@Param('matchId') matchId: string, @Body() updateDto: UpdateLiveStatusDto) {
    try {
      if (!/^[0-9a-fA-F]{24}$/.test(matchId)) {
        return {
          statusCode: HttpStatus.BAD_REQUEST,
          status: false,
          userMessage: 'Invalid match ID format',
          userMessageCode: 'INVALID_MATCH_ID',
          developerMessage: 'Match ID must be a valid MongoDB ObjectId',
          data: null,
        };
      }

      const result = await this.mainAppService.send('live-match.updateLiveStatus', { matchId, updateDto });
      return result;
    } catch (error: any) {
      this.logger.error('Error in updateLiveStatus', error.stack || error.message || error);
      return {
        statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
        status: false,
        userMessage: 'Failed to update live status',
        userMessageCode: 'LIVE_STATUS_UPDATE_FAILED',
        developerMessage: error.message,
        data: null,
      };
    }
  }

  @Post('switch-teams')
  @HttpCode(HttpStatus.OK)
  @UsePipes(new ValidationPipe({ transform: true }))
  async switchTeams(@Param('matchId') matchId: string, @Body() switchDto: SwitchTeamDto) {
    try {
      if (!/^[0-9a-fA-F]{24}$/.test(matchId)) {
        return {
          statusCode: HttpStatus.BAD_REQUEST,
          status: false,
          userMessage: 'Invalid match ID format',
          userMessageCode: 'INVALID_MATCH_ID',
          developerMessage: 'Match ID must be a valid MongoDB ObjectId',
          data: null,
        };
      }

      const result = await this.mainAppService.send('live-match.switchTeams', { matchId, switchDto });
      return result;
    } catch (error: any) {
      this.logger.error('Error in switchTeams', error.stack || error.message || error);
      return {
        statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
        status: false,
        userMessage: 'Failed to switch teams',
        userMessageCode: 'TEAMS_SWITCH_FAILED',
        developerMessage: error.message,
        data: null,
      };
    }
  }

  @Put('toss')
  @HttpCode(HttpStatus.OK)
  @UsePipes(new ValidationPipe({ transform: true }))
  async updateToss(@Param('matchId') matchId: string, @Body() updateTossDto: UpdateTossDto) {
    try {
      if (!/^[0-9a-fA-F]{24}$/.test(matchId)) {
        return {
          statusCode: HttpStatus.BAD_REQUEST,
          status: false,
          userMessage: 'Invalid match ID format',
          userMessageCode: 'INVALID_MATCH_ID',
          developerMessage: 'Match ID must be a valid MongoDB ObjectId',
          data: null,
        };
      }

      const result = await this.mainAppService.send('live-match.updateToss', {
        matchId,
        updateTossDto,
      });
      return result;
    } catch (error: any) {
      this.logger.error('Error in updateToss', error.stack || error.message || error);
      return {
        statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
        status: false,
        userMessage: 'Failed to update toss',
        userMessageCode: 'TOSS_UPDATE_FAILED',
        developerMessage: error.message,
        data: null,
      };
    }
  }

  // Match Squad APIs
  @Get('squads')
  @HttpCode(HttpStatus.OK)
  async getMatchSquads(@Param('matchId') matchId: string) {
    try {
      if (!/^[0-9a-fA-F]{24}$/.test(matchId)) {
        return {
          statusCode: HttpStatus.BAD_REQUEST,
          status: false,
          userMessage: 'Invalid match ID format',
          userMessageCode: 'INVALID_MATCH_ID',
          developerMessage: 'Match ID must be a valid MongoDB ObjectId',
          data: null,
        };
      }

      const result = await this.mainAppService.send('live-match.getSquads', matchId);
      return result;
    } catch (error: any) {
      this.logger.error('Error in getMatchSquads', error.stack || error.message || error);
      return {
        statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
        status: false,
        userMessage: 'Failed to fetch match squads',
        userMessageCode: 'MATCH_SQUADS_FETCH_FAILED',
        developerMessage: error.message,
        data: null,
      };
    }
  }

  @Put('squads/:teamId')
  @HttpCode(HttpStatus.OK)
  @UsePipes(new ValidationPipe({ transform: true }))
  async updateMatchSquad(
    @Param('matchId') matchId: string,
    @Param('teamId') teamId: string,
    @Body() updateDto: UpdateMatchSquadDto,
  ) {
    try {
      if (!/^[0-9a-fA-F]{24}$/.test(matchId) || !/^[0-9a-fA-F]{24}$/.test(teamId)) {
        return {
          statusCode: HttpStatus.BAD_REQUEST,
          status: false,
          userMessage: 'Invalid match ID or team ID format',
          userMessageCode: 'INVALID_ID',
          developerMessage: 'Match ID and Team ID must be valid MongoDB ObjectIds',
          data: null,
        };
      }

      const result = await this.mainAppService.send('live-match.updateSquad', { matchId, teamId, updateDto });
      return result;
    } catch (error: any) {
      this.logger.error('Error in updateMatchSquad', error.stack || error.message || error);
      return {
        statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
        status: false,
        userMessage: 'Failed to update match squad',
        userMessageCode: 'MATCH_SQUAD_UPDATE_FAILED',
        developerMessage: error.message,
        data: null,
      };
    }
  }

  // Scorecard APIs
  @Get('scorecard/:inningNumber')
  @HttpCode(HttpStatus.OK)
  async getScorecard(@Param('matchId') matchId: string, @Param('inningNumber') inningNumber: string) {
    try {
      if (!/^[0-9a-fA-F]{24}$/.test(matchId)) {
        return {
          statusCode: HttpStatus.BAD_REQUEST,
          status: false,
          userMessage: 'Invalid match ID format',
          userMessageCode: 'INVALID_MATCH_ID',
          developerMessage: 'Match ID must be a valid MongoDB ObjectId',
          data: null,
        };
      }

      const inningNum = parseInt(inningNumber, 10);
      if (isNaN(inningNum) || inningNum < 1 || inningNum > 10) {
        return {
          statusCode: HttpStatus.BAD_REQUEST,
          status: false,
          userMessage: 'Invalid inning number',
          userMessageCode: 'INVALID_INNING_NUMBER',
          developerMessage: 'Inning number must be between 1 and 10',
          data: null,
        };
      }

      const result = await this.mainAppService.send('live-match.getScorecard', { matchId, inningNumber: inningNum });
      if (!result) {
        throw new Error('No response from main app service');
      }
      return result;
    } catch (error: any) {
      this.logger.error('Error in getScorecard', error.stack || error.message || error);
      return {
        statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
        status: false,
        userMessage: 'Failed to fetch scorecard',
        userMessageCode: 'SCORECARD_FETCH_FAILED',
        developerMessage: error?.message || error?.toString() || 'Unknown error',
        data: null,
      };
    }
  }

  @Put('scorecard/:inningNumber/batsman/:playerId')
  @HttpCode(HttpStatus.OK)
  @UsePipes(new ValidationPipe({ transform: true }))
  async updateBatsman(
    @Param('matchId') matchId: string,
    @Param('inningNumber') inningNumber: string,
    @Param('playerId') playerId: string,
    @Body() updateDto: UpdateBatsmanDto,
  ) {
    try {
      if (!/^[0-9a-fA-F]{24}$/.test(matchId) || !/^[0-9a-fA-F]{24}$/.test(playerId)) {
        return {
          statusCode: HttpStatus.BAD_REQUEST,
          status: false,
          userMessage: 'Invalid match ID or player ID format',
          userMessageCode: 'INVALID_ID',
          developerMessage: 'Match ID and Player ID must be valid MongoDB ObjectIds',
          data: null,
        };
      }

      const inningNum = parseInt(inningNumber, 10);
      if (isNaN(inningNum) || inningNum < 1 || inningNum > 10) {
        return {
          statusCode: HttpStatus.BAD_REQUEST,
          status: false,
          userMessage: 'Invalid inning number',
          userMessageCode: 'INVALID_INNING_NUMBER',
          developerMessage: 'Inning number must be between 1 and 10',
          data: null,
        };
      }

      const result = await this.mainAppService.send('live-match.updateBatsman', {
        matchId,
        inningNumber: inningNum,
        playerId,
        updateDto,
      });
      return result;
    } catch (error: any) {
      this.logger.error('Error in updateBatsman', error.stack || error.message || error);
      return {
        statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
        status: false,
        userMessage: 'Failed to update batsman stats',
        userMessageCode: 'BATSMAN_UPDATE_FAILED',
        developerMessage: error.message,
        data: null,
      };
    }
  }

  @Put('scorecard/:inningNumber/bowler/:playerId')
  @HttpCode(HttpStatus.OK)
  @UsePipes(new ValidationPipe({ transform: true }))
  async updateBowler(
    @Param('matchId') matchId: string,
    @Param('inningNumber') inningNumber: string,
    @Param('playerId') playerId: string,
    @Body() updateDto: UpdateBowlerDto,
  ) {
    try {
      if (!/^[0-9a-fA-F]{24}$/.test(matchId) || !/^[0-9a-fA-F]{24}$/.test(playerId)) {
        return {
          statusCode: HttpStatus.BAD_REQUEST,
          status: false,
          userMessage: 'Invalid match ID or player ID format',
          userMessageCode: 'INVALID_ID',
          developerMessage: 'Match ID and Player ID must be valid MongoDB ObjectIds',
          data: null,
        };
      }

      const inningNum = parseInt(inningNumber, 10);
      if (isNaN(inningNum) || inningNum < 1 || inningNum > 10) {
        return {
          statusCode: HttpStatus.BAD_REQUEST,
          status: false,
          userMessage: 'Invalid inning number',
          userMessageCode: 'INVALID_INNING_NUMBER',
          developerMessage: 'Inning number must be between 1 and 10',
          data: null,
        };
      }

      const result = await this.mainAppService.send('live-match.updateBowler', {
        matchId,
        inningNumber: inningNum,
        playerId,
        updateDto,
      });
      return result;
    } catch (error: any) {
      this.logger.error('Error in updateBowler', error.stack || error.message || error);
      return {
        statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
        status: false,
        userMessage: 'Failed to update bowler stats',
        userMessageCode: 'BOWLER_UPDATE_FAILED',
        developerMessage: error.message,
        data: null,
      };
    }
  }

  @Put('scorecard/:inningNumber/inning')
  @HttpCode(HttpStatus.OK)
  @UsePipes(new ValidationPipe({ transform: true }))
  async updateInning(
    @Param('matchId') matchId: string,
    @Param('inningNumber') inningNumber: string,
    @Body() updateDto: UpdateInningDto,
  ) {
    try {
      if (!/^[0-9a-fA-F]{24}$/.test(matchId)) {
        return {
          statusCode: HttpStatus.BAD_REQUEST,
          status: false,
          userMessage: 'Invalid match ID format',
          userMessageCode: 'INVALID_MATCH_ID',
          developerMessage: 'Match ID must be a valid MongoDB ObjectId',
          data: null,
        };
      }

      const inningNum = parseInt(inningNumber, 10);
      if (isNaN(inningNum) || inningNum < 1 || inningNum > 10) {
        return {
          statusCode: HttpStatus.BAD_REQUEST,
          status: false,
          userMessage: 'Invalid inning number',
          userMessageCode: 'INVALID_INNING_NUMBER',
          developerMessage: 'Inning number must be between 1 and 10',
          data: null,
        };
      }

      const result = await this.mainAppService.send('live-match.updateInning', {
        matchId,
        inningNumber: inningNum,
        updateDto,
      });
      return result;
    } catch (error: any) {
      this.logger.error('Error in updateInning', error.stack || error.message || error);
      return {
        statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
        status: false,
        userMessage: 'Failed to update inning',
        userMessageCode: 'INNING_UPDATE_FAILED',
        developerMessage: error.message,
        data: null,
      };
    }
  }

  @Get('over-summaries/:inningNumber')
  @HttpCode(HttpStatus.OK)
  async getOverSummaries(
    @Param('matchId') matchId: string,
    @Param('inningNumber') inningNumber: string,
  ) {
    try {
      if (!/^[0-9a-fA-F]{24}$/.test(matchId)) {
        return {
          statusCode: HttpStatus.BAD_REQUEST,
          status: false,
          userMessage: 'Invalid match ID format',
          userMessageCode: 'INVALID_ID',
          developerMessage: 'Match ID must be a valid MongoDB ObjectId',
          data: null,
        };
      }

      const inningNum = parseInt(inningNumber, 10);
      if (isNaN(inningNum) || inningNum < 1 || inningNum > 10) {
        return {
          statusCode: HttpStatus.BAD_REQUEST,
          status: false,
          userMessage: 'Invalid inning number',
          userMessageCode: 'INVALID_INNING_NUMBER',
          developerMessage: 'Inning number must be between 1 and 10',
          data: null,
        };
      }

      const result = await this.mainAppService.send('live-match.getOverSummaries', {
        matchId,
        inningNumber: inningNum,
      });
      if (!result) {
        throw new Error('No response from main app service');
      }
      return result;
    } catch (error: any) {
      this.logger.error('Error in getOverSummaries', error.stack || error.message || error);
      return {
        statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
        status: false,
        userMessage: 'Failed to fetch over summaries',
        userMessageCode: 'OVER_SUMMARIES_FETCH_FAILED',
        developerMessage: error?.message || error?.toString() || 'Unknown error',
        data: null,
      };
    }
  }

  @Put('over-summaries/update')
  @HttpCode(HttpStatus.OK)
  @UsePipes(new ValidationPipe({ transform: true }))
  async updateOverSummary(
    @Param('matchId') matchId: string,
    @Body() body: { inningNumber: number; overNumber: number; ballsData: any[] },
  ) {
    try {
      if (!/^[0-9a-fA-F]{24}$/.test(matchId)) {
        return {
          statusCode: HttpStatus.BAD_REQUEST,
          status: false,
          userMessage: 'Invalid match ID format',
          userMessageCode: 'INVALID_ID',
          developerMessage: 'Match ID must be a valid MongoDB ObjectId',
          data: null,
        };
      }

      if (!body.inningNumber || !body.overNumber || !body.ballsData) {
        return {
          statusCode: HttpStatus.BAD_REQUEST,
          status: false,
          userMessage: 'Missing required fields',
          userMessageCode: 'MISSING_FIELDS',
          developerMessage: 'inningNumber, overNumber, and ballsData are required',
          data: null,
        };
      }

      const result = await this.mainAppService.send('live-match.updateOverSummary', {
        matchId,
        inningNumber: body.inningNumber,
        overNumber: body.overNumber,
        ballsData: body.ballsData,
      });
      return result;
    } catch (error: any) {
      this.logger.error('Error in updateOverSummary', error.stack || error.message || error);
      return {
        statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
        status: false,
        userMessage: 'Failed to update over summary',
        userMessageCode: 'OVER_SUMMARY_UPDATE_FAILED',
        developerMessage: error.message,
        data: null,
      };
    }
  }

  @Post('over-summaries/:inningNumber')
  @HttpCode(HttpStatus.OK)
  @UsePipes(new ValidationPipe({ transform: true }))
  async upsertOverSummary(
    @Param('matchId') matchId: string,
    @Param('inningNumber') inningNumber: string,
    @Body() body: { overNumber: number; bowlerId: string; ballsData: any[] },
  ) {
    try {
      if (!/^[0-9a-fA-F]{24}$/.test(matchId) || !/^[0-9a-fA-F]{24}$/.test(body.bowlerId)) {
        return {
          statusCode: HttpStatus.BAD_REQUEST,
          status: false,
          userMessage: 'Invalid match ID or bowler ID format',
          userMessageCode: 'INVALID_ID',
          developerMessage: 'Match ID and bowler ID must be valid MongoDB ObjectIds',
          data: null,
        };
      }

      const inningNum = parseInt(inningNumber, 10);
      if (isNaN(inningNum) || inningNum < 1 || inningNum > 10) {
        return {
          statusCode: HttpStatus.BAD_REQUEST,
          status: false,
          userMessage: 'Invalid inning number',
          userMessageCode: 'INVALID_INNING_NUMBER',
          developerMessage: 'Inning number must be between 1 and 10',
          data: null,
        };
      }

      if (!body.overNumber || !body.bowlerId || !body.ballsData) {
        return {
          statusCode: HttpStatus.BAD_REQUEST,
          status: false,
          userMessage: 'Missing required fields',
          userMessageCode: 'MISSING_FIELDS',
          developerMessage: 'overNumber, bowlerId, and ballsData are required',
          data: null,
        };
      }

      const result = await this.mainAppService.send('live-match.upsertOverSummary', {
        matchId,
        inningNumber: inningNum,
        overNumber: body.overNumber,
        bowlerId: body.bowlerId,
        ballsData: body.ballsData,
      });
      return result;
    } catch (error: any) {
      this.logger.error('Error in upsertOverSummary', error.stack || error.message || error);
      return {
        statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
        status: false,
        userMessage: 'Failed to save over summary',
        userMessageCode: 'OVER_SUMMARY_SAVE_FAILED',
        developerMessage: error.message,
        data: null,
      };
    }
  }

  @Post('scorecard/:inningNumber/initialize/:teamId')
  @HttpCode(HttpStatus.OK)
  async initializeScorecards(
    @Param('matchId') matchId: string,
    @Param('inningNumber') inningNumber: string,
    @Param('teamId') teamId: string,
  ) {
    try {
      if (!/^[0-9a-fA-F]{24}$/.test(matchId) || !/^[0-9a-fA-F]{24}$/.test(teamId)) {
        return {
          statusCode: HttpStatus.BAD_REQUEST,
          status: false,
          userMessage: 'Invalid match ID or team ID format',
          userMessageCode: 'INVALID_ID',
          developerMessage: 'Match ID and Team ID must be valid MongoDB ObjectIds',
          data: null,
        };
      }

      const inningNum = parseInt(inningNumber, 10);
      if (isNaN(inningNum) || inningNum < 1 || inningNum > 10) {
        return {
          statusCode: HttpStatus.BAD_REQUEST,
          status: false,
          userMessage: 'Invalid inning number',
          userMessageCode: 'INVALID_INNING_NUMBER',
          developerMessage: 'Inning number must be between 1 and 10',
          data: null,
        };
      }

      const result = await this.mainAppService.send('live-match.initializeScorecards', {
        matchId,
        inningNumber: inningNum,
        teamId,
      });
      if (!result) {
        throw new Error('No response from main app service');
      }
      return result;
    } catch (error: any) {
      this.logger.error('Error in initializeScorecards', error.stack || error.message || error);
      return {
        statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
        status: false,
        userMessage: 'Failed to initialize scorecards',
        userMessageCode: 'SCORECARDS_INITIALIZATION_FAILED',
        developerMessage: error?.message || error?.toString() || 'Unknown error',
        data: null,
      };
    }
  }
  // Session APIs
  @Get('sessions')
  @HttpCode(HttpStatus.OK)
  async getSessions(@Param('matchId') matchId: string) {
    try {
      if (!/^[0-9a-fA-F]{24}$/.test(matchId)) {
        return {
          statusCode: HttpStatus.BAD_REQUEST,
          status: false,
          userMessage: 'Invalid match ID format',
          userMessageCode: 'INVALID_MATCH_ID',
          developerMessage: 'Match ID must be a valid MongoDB ObjectId',
          data: null,
        };
      }

      const result = await this.mainAppService.send('live-match.getSessions', matchId);
      if (!result) {
        throw new Error('No response from main app service');
      }
      return result;
    } catch (error: any) {
      this.logger.error('Error in getSessions', error.stack || error.message || error);
      return {
        statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
        status: false,
        userMessage: 'Failed to fetch sessions',
        userMessageCode: 'SESSIONS_FETCH_FAILED',
        developerMessage: error?.message || error?.toString() || 'Unknown error',
        data: null,
      };
    }
  }

  @Post('sessions')
  @HttpCode(HttpStatus.OK)
  async addSession(@Param('matchId') matchId: string, @Body() body: any) {
    try {
      if (!/^[0-9a-fA-F]{24}$/.test(matchId)) {
        return {
          statusCode: HttpStatus.BAD_REQUEST,
          status: false,
          userMessage: 'Invalid match ID format',
          userMessageCode: 'INVALID_MATCH_ID',
          developerMessage: 'Match ID must be a valid MongoDB ObjectId',
          data: null,
        };
      }

      const result = await this.mainAppService.send('live-match.addSession', {
        matchId,
        createDto: body,
      });
      return result;
    } catch (error: any) {
      this.logger.error('Error in addSession', error.stack || error.message || error);
      return {
        statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
        status: false,
        userMessage: 'Failed to add session',
        userMessageCode: 'SESSION_ADD_FAILED',
        developerMessage: error.message,
        data: null,
      };
    }
  }

  @Put('sessions/:sessionId')
  @HttpCode(HttpStatus.OK)
  async updateSession(
    @Param('matchId') matchId: string,
    @Param('sessionId') sessionId: string,
    @Body() body: any,
  ) {
    try {
      if (!/^[0-9a-fA-F]{24}$/.test(matchId)) {
        return {
          statusCode: HttpStatus.BAD_REQUEST,
          status: false,
          userMessage: 'Invalid match ID format',
          userMessageCode: 'INVALID_MATCH_ID',
          developerMessage: 'Match ID must be a valid MongoDB ObjectId',
          data: null,
        };
      }

      const result = await this.mainAppService.send('live-match.updateSession', {
        matchId,
        sessionId,
        updateDto: body,
      });
      return result;
    } catch (error: any) {
      this.logger.error('Error in updateSession', error.stack || error.message || error);
      return {
        statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
        status: false,
        userMessage: 'Failed to update session',
        userMessageCode: 'SESSION_UPDATE_FAILED',
        developerMessage: error.message,
        data: null,
      };
    }
  }

  @Delete('sessions/:sessionId')
  @HttpCode(HttpStatus.OK)
  async deleteSession(@Param('matchId') matchId: string, @Param('sessionId') sessionId: string) {
    try {
      if (!/^[0-9a-fA-F]{24}$/.test(matchId)) {
        return {
          statusCode: HttpStatus.BAD_REQUEST,
          status: false,
          userMessage: 'Invalid match ID format',
          userMessageCode: 'INVALID_MATCH_ID',
          developerMessage: 'Match ID must be a valid MongoDB ObjectId',
          data: null,
        };
      }

      const result = await this.mainAppService.send('live-match.deleteSession', {
        matchId,
        sessionId,
      });
      return result;
    } catch (error: any) {
      this.logger.error('Error in deleteSession', error.stack || error.message || error);
      return {
        statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
        status: false,
        userMessage: 'Failed to delete session',
        userMessageCode: 'SESSION_DELETE_FAILED',
        developerMessage: error.message,
        data: null,
      };
    }
  }

  @Post('event')
  @HttpCode(HttpStatus.OK)
  @UsePipes(new ValidationPipe({ transform: true }))
  async handleEvent(@Param('matchId') matchId: string, @Body() event: ScoreEventDto) {
    try {
      console.log('handleEvent payload controller', matchId, event);
      if (!/^[0-9a-fA-F]{24}$/.test(matchId)) {
        return {
          statusCode: HttpStatus.BAD_REQUEST,
          status: false,
          userMessage: 'Invalid match ID format',
          userMessageCode: 'INVALID_MATCH_ID',
          developerMessage: 'Match ID must be a valid MongoDB ObjectId',
          data: null,
        };
      }

      const result = await this.mainAppService.send('live-match.handleEvent', { matchId, event });
      return result;
    } catch (error: any) {
      this.logger.error('Error in handleEvent', error.stack || error.message || error);
      return {
        statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
        status: false,
        userMessage: 'Failed to process event',
        userMessageCode: 'EVENT_PROCESS_FAILED',
        developerMessage: error.message,
        data: null,
      };
    }
  }

  @Post('simple-event')
  @HttpCode(HttpStatus.OK)
  @UsePipes(new ValidationPipe({ transform: true }))
  async handleSimpleEvent(@Param('matchId') matchId: string, @Body() simpleEvent: SimpleEventDto) {
    try {
      console.log('handleSimpleEvent payload controller', matchId, simpleEvent);
      if (!/^[0-9a-fA-F]{24}$/.test(matchId)) {
        return {
          statusCode: HttpStatus.BAD_REQUEST,
          status: false,
          userMessage: 'Invalid match ID format',
          userMessageCode: 'INVALID_MATCH_ID',
          developerMessage: 'Match ID must be a valid MongoDB ObjectId',
          data: null,
        };
      }

      const result = await this.mainAppService.send('live-match.handleSimpleEvent', {
        matchId,
        event: simpleEvent.event,
        bowlerName: simpleEvent.bowlerName,
        batsmanName: simpleEvent.batsmanName
      });
      return result;
    } catch (error: any) {
      this.logger.error('Error in handleSimpleEvent', error.stack || error.message || error);
      return {
        statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
        status: false,
        userMessage: 'Failed to process simple event',
        userMessageCode: 'SIMPLE_EVENT_PROCESS_FAILED',
        developerMessage: error.message,
        data: null,
      };
    }
  }

  @Post('set-striker/:inningNumber/:playerId')
  @HttpCode(HttpStatus.OK)
  async setStriker(
    @Param('matchId') matchId: string,
    @Param('inningNumber') inningNumber: number,
    @Param('playerId') playerId: string,
  ) {
    try {
      if (!/^[0-9a-fA-F]{24}$/.test(matchId) || !/^[0-9a-fA-F]{24}$/.test(playerId)) {
        return {
          statusCode: HttpStatus.BAD_REQUEST,
          status: false,
          userMessage: 'Invalid ID format',
          userMessageCode: 'INVALID_ID',
          developerMessage: 'Match ID and Player ID must be valid MongoDB ObjectIds',
          data: null,
        };
      }

      const result = await this.mainAppService.send('live-match.setStriker', {
        matchId,
        inningNumber: parseInt(inningNumber.toString()),
        playerId,
      });
      return result;
    } catch (error: any) {
      this.logger.error('Error in setStriker', error.stack || error.message || error);
      return {
        statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
        status: false,
        userMessage: 'Failed to set striker',
        userMessageCode: 'SET_STRIKER_FAILED',
        developerMessage: error.message,
        data: null,
      };
    }
  }

  @Post('set-non-striker/:inningNumber/:playerId')
  @HttpCode(HttpStatus.OK)
  async setNonStriker(
    @Param('matchId') matchId: string,
    @Param('inningNumber') inningNumber: number,
    @Param('playerId') playerId: string,
  ) {
    try {
      if (!/^[0-9a-fA-F]{24}$/.test(matchId) || !/^[0-9a-fA-F]{24}$/.test(playerId)) {
        return {
          statusCode: HttpStatus.BAD_REQUEST,
          status: false,
          userMessage: 'Invalid ID format',
          userMessageCode: 'INVALID_ID',
          developerMessage: 'Match ID and Player ID must be valid MongoDB ObjectIds',
          data: null,
        };
      }

      const result = await this.mainAppService.send('live-match.setNonStriker', {
        matchId,
        inningNumber: parseInt(inningNumber.toString()),
        playerId,
      });
      return result;
    } catch (error: any) {
      this.logger.error('Error in setNonStriker', error.stack || error.message || error);
      return {
        statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
        status: false,
        userMessage: 'Failed to set non-striker',
        userMessageCode: 'SET_NON_STRIKER_FAILED',
        developerMessage: error.message,
        data: null,
      };
    }
  }

  @Post('swap-batsmen/:inningNumber')
  @HttpCode(HttpStatus.OK)
  async swapBatsmen(
    @Param('matchId') matchId: string,
    @Param('inningNumber') inningNumber: number,
  ) {
    try {
      if (!/^[0-9a-fA-F]{24}$/.test(matchId)) {
        return {
          statusCode: HttpStatus.BAD_REQUEST,
          status: false,
          userMessage: 'Invalid match ID format',
          userMessageCode: 'INVALID_MATCH_ID',
          developerMessage: 'Match ID must be a valid MongoDB ObjectId',
          data: null,
        };
      }

      const result = await this.mainAppService.send('live-match.swapBatsmen', {
        matchId,
        inningNumber: parseInt(inningNumber.toString()),
      });
      return result;
    } catch (error: any) {
      this.logger.error('Error in swapBatsmen', error.stack || error.message || error);
      return {
        statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
        status: false,
        userMessage: 'Failed to swap batsmen',
        userMessageCode: 'SWAP_BATSMEN_FAILED',
        developerMessage: error.message,
        data: null,
      };
    }
  }

  @Post('set-current-bowler/:inningNumber/:playerId')
  @HttpCode(HttpStatus.OK)
  async setCurrentBowler(
    @Param('matchId') matchId: string,
    @Param('inningNumber') inningNumber: number,
    @Param('playerId') playerId: string,
  ) {
    try {
      if (!/^[0-9a-fA-F]{24}$/.test(matchId) || !/^[0-9a-fA-F]{24}$/.test(playerId)) {
        return {
          statusCode: HttpStatus.BAD_REQUEST,
          status: false,
          userMessage: 'Invalid ID format',
          userMessageCode: 'INVALID_ID',
          developerMessage: 'Match ID and Player ID must be valid MongoDB ObjectIds',
          data: null,
        };
      }

      const result = await this.mainAppService.send('live-match.setCurrentBowler', {
        matchId,
        inningNumber: parseInt(inningNumber.toString()),
        playerId,
      });
      return result;
    } catch (error: any) {
      this.logger.error('Error in setCurrentBowler', error.stack || error.message || error);
      return {
        statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
        status: false,
        userMessage: 'Failed to set current bowler',
        userMessageCode: 'SET_CURRENT_BOWLER_FAILED',
        developerMessage: error.message,
        data: null,
      };
    }
  }

  @Get('recent-overs')
  @HttpCode(HttpStatus.OK)
  async getRecentOvers(
    @Param('matchId') matchId: string,
    @Query('inningNumber') inningNumber?: string,
  ) {
    try {
      if (!/^[0-9a-fA-F]{24}$/.test(matchId)) {
        return {
          statusCode: HttpStatus.BAD_REQUEST,
          status: false,
          userMessage: 'Invalid match ID format',
          userMessageCode: 'INVALID_MATCH_ID',
          developerMessage: 'Match ID must be a valid MongoDB ObjectId',
          data: null,
        };
      }

      let inningNum: number | undefined;
      if (inningNumber) {
        inningNum = parseInt(inningNumber, 10);
        if (isNaN(inningNum) || inningNum < 1 || inningNum > 4) {
          return {
            statusCode: HttpStatus.BAD_REQUEST,
            status: false,
            userMessage: 'Invalid inning number',
            userMessageCode: 'INVALID_INNING_NUMBER',
            developerMessage: 'Inning number must be between 1 and 4',
            data: null,
          };
        }
      }

      const result = await this.mainAppService.send('live-match.getRecentOvers', {
        matchId,
        inningNumber: inningNum,
      });
      if (!result) {
        throw new Error('No response from main app service');
      }
      return result;
    } catch (error: any) {
      this.logger.error('Error in getRecentOvers', error.stack || error.message || error);
      return {
        statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
        status: false,
        userMessage: 'Failed to fetch recent overs',
        userMessageCode: 'RECENT_OVERS_FETCH_FAILED',
        developerMessage: error?.message || error?.toString() || 'Unknown error',
        data: null,
      };
    }
  }
  @Get('commentary')
  @HttpCode(HttpStatus.OK)
  async getCommentary(
    @Param('matchId') matchId: string,
    @Query('inningId') inningId?: string,
  ) {
    try {
      if (!/^[0-9a-fA-F]{24}$/.test(matchId)) {
        return {
          statusCode: HttpStatus.BAD_REQUEST,
          status: false,
          userMessage: 'Invalid match ID format',
          developerMessage: 'Match ID must be a valid MongoDB ObjectId',
          data: null,
        };
      }

      const result = await this.mainAppService.send('live-match.getCommentary', { matchId, inningId });
      return result;
    } catch (error: any) {
      this.logger.error('Error in getCommentary', error.stack || error.message || error);
      return {
        statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
        status: false,
        userMessage: 'Failed to fetch commentary',
        developerMessage: error?.message || 'Unknown error',
        data: null,
      };
    }
  }

  @Patch('commentary/:commentaryId')
  @HttpCode(HttpStatus.OK)
  async updateCommentary(
    @Param('matchId') matchId: string,
    @Param('commentaryId') commentaryId: string,
    @Body('commentary') commentary: string,
  ) {
    try {
      const result = await this.mainAppService.send('live-match.updateCommentary', {
        commentaryId,
        commentary,
      });
      return result;
    } catch (error: any) {
      this.logger.error('Error in updateCommentary', error.stack || error.message || error);
      return {
        statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
        status: false,
        userMessage: 'Failed to update commentary',
        developerMessage: error?.message || 'Unknown error',
        data: null,
      };
    }
  }

  @Delete('commentary/:commentaryId')
  @HttpCode(HttpStatus.OK)
  async deleteCommentary(
    @Param('matchId') matchId: string,
    @Param('commentaryId') commentaryId: string,
  ) {
    try {
      const result = await this.mainAppService.send('live-match.deleteCommentary', { commentaryId });
      return result;
    } catch (error: any) {
      this.logger.error('Error in deleteCommentary', error.stack || error.message || error);
      return {
        statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
        status: false,
        userMessage: 'Failed to delete commentary',
        developerMessage: error?.message || 'Unknown error',
        data: null,
      };
    }
  }

  @Post('super-over')
  @HttpCode(HttpStatus.OK)
  @UsePipes(new ValidationPipe({ transform: true }))
  async startSuperOver(@Param('matchId') matchId: string, @Body() startDto?: StartSuperOverDto) {
    try {
      if (!/^[0-9a-fA-F]{24}$/.test(matchId)) {
        return {
          statusCode: HttpStatus.BAD_REQUEST,
          status: false,
          userMessage: 'Invalid match ID format',
          userMessageCode: 'INVALID_MATCH_ID',
          developerMessage: 'Match ID must be a valid MongoDB ObjectId',
          data: null,
        };
      }

      const result = await this.mainAppService.send('live-match.startSuperOver', matchId);
      return result;
    } catch (error: any) {
      this.logger.error('Error in startSuperOver', error.stack || error.message || error);
      return {
        statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
        status: false,
        userMessage: 'Failed to start Super Over',
        userMessageCode: 'SUPER_OVER_START_FAILED',
        developerMessage: error.message,
        data: null,
      };
    }
  }
}
