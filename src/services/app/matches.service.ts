import { Injectable, Logger } from '@nestjs/common';
import { MainAppService } from '../main-app.service';

@Injectable()
export class AppMatchesService {
  private readonly logger = new Logger(AppMatchesService.name);

  constructor(private readonly mainAppService: MainAppService) {}

  async findAll(query: any) {
    const result = await this.mainAppService.send('matches.findAll', query);
    
    if (result && result.data && Array.isArray(result.data.result)) {
      const mapped = result.data.result.map((match: any) => this.sanitizeMatch(match));
      return {
        ...result,
        data: {
          ...result.data,
          result: mapped
        }
      };
    } else if (result && result.data && Array.isArray(result.data.data)) {
      result.data.data = result.data.data.map((match: any) => this.sanitizeMatch(match));
    } else if (result && result.data) {
      if (Array.isArray(result.data)) {
        result.data = result.data.map((match: any) => this.sanitizeMatch(match));
      } else {
        result.data = this.sanitizeMatch(result.data);
      }
    } else if (Array.isArray(result)) {
      return result.map((match: any) => this.sanitizeMatch(match));
    }
    
    return result;
  }

  async findOne(id: string) {
    const result = await this.mainAppService.send('matches.findOne', id);
    
    this.logger.log(`[findOne] Raw result for ${id}: ${JSON.stringify(result?.data || result).substring(0, 500)}...`);
    
    if (result && result.data) {
      // Direct replace for findOne
      this.logger.log(`[findOne] Returning full data: teamAId=${JSON.stringify(result.data.teamAId)?.substring(0,100)}, venueId=${JSON.stringify(result.data.venueId)?.substring(0,100)}, seriesId=${JSON.stringify(result.data.seriesId)?.substring(0,100)}`);
      return {
        ...result,
        data: result.data // Bypass sanitizeMatch to provide full details for MatchDetailScreen
      }
    } else if (result && !result.status) {
      return result;
    }
    
    return result;
  }

  private sanitizeMatch(match: any) {
    if (!match) return match;

    const getName = (obj: any, fallback: string = '') => {
        if (!obj) return fallback;
        if (typeof obj === 'string') return obj;
        return obj.shortName || obj.name || fallback;
    };
    
    const getCode = (obj: any, fallback: string = '') => {
        if (!obj) return fallback;
        if (typeof obj === 'string') return obj;
        return obj.code || obj.shortName || obj.name?.substring(0, 3)?.toUpperCase() || fallback;
    };

    let team1Score, team1Overs, team2Score, team2Overs, runRate;
    let battingTeamCode = '';

    if (match.liveStatus) {
        battingTeamCode = match.liveStatus.battingTeam?.toString() || '';
        
        if (Array.isArray(match.liveStatus.innings)) {
            const t1Id = match.teamAId?._id?.toString() || match.teamAId?.toString();
            const t2Id = match.teamBId?._id?.toString() || match.teamBId?.toString();

            const t1Scores: string[] = [];
            const t2Scores: string[] = [];
            let t1LatestOvers = '';
            let t2LatestOvers = '';
            
            match.liveStatus.innings.forEach((inn: any) => {
                const batId = inn.battingTeamId?.toString();
                
                const scoreStr = `${inn.totalRuns || 0}/${inn.totalWickets || 0}`;
                const overs = Math.floor((inn.totalBalls || 0) / 6);
                const balls = (inn.totalBalls || 0) % 6;
                const oversStr = `${overs}.${balls}`;

                if (batId === t1Id) {
                    t1Scores.push(scoreStr);
                    t1LatestOvers = oversStr;
                } else if (batId === t2Id) {
                    t2Scores.push(scoreStr);
                    t2LatestOvers = oversStr;
                }
            });

            if (t1Scores.length > 0) {
               team1Score = t1Scores.join(' & ');
               team1Overs = t1LatestOvers;
            }
            if (t2Scores.length > 0) {
               team2Score = t2Scores.join(' & ');
               team2Overs = t2LatestOvers;
            }
        }
    }

    let displayStatus = 'Scheduled';
    if (match.status === 'live') displayStatus = 'Live';
    else if (match.status === 'completed') displayStatus = 'Completed';
    else if (match.status === 'cancelled') displayStatus = 'Cancelled';
    else if (match.status === 'abandoned') displayStatus = 'Abandoned';

    let resultString = undefined;
    if (match.result && match.result.resultText) {
        resultString = match.result.resultText;
    } else if (match.toss && match.toss.tossText) {
        resultString = match.toss.tossText;
    } else if (match.matchState) {
        resultString = match.matchState.replace(/_/g, ' ');
        resultString = resultString.charAt(0).toUpperCase() + resultString.slice(1);
    }

    return {
      id: match._id,
      series: getName(match.seriesId, 'Unknown Series'),
      format: (match.matchFormat || 'T20').toUpperCase(),
      team1: { 
          id: match.teamAId?._id?.toString() || match.teamAId?.toString(),
          name: getName(match.teamAId, 'Team A'), 
          code: getCode(match.teamAId, 'T1'),
          score: team1Score,
          overs: team1Overs
      },
      team2: { 
          id: match.teamBId?._id?.toString() || match.teamBId?.toString(),
          name: getName(match.teamBId, 'Team B'), 
          code: getCode(match.teamBId, 'T2'),
          score: team2Score,
          overs: team2Overs
      },
      status: displayStatus,
      battingTeam: battingTeamCode,
      venue: getName(match.venueId, 'Unknown Venue'),
      time: match.matchTime || match.matchDate,
      runRate: runRate,
      result: resultString
    };
  }
}
