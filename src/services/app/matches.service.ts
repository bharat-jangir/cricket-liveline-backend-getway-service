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
    
    if (result && result.data) {
      // Direct replace for findOne
      return {
        ...result,
        data: this.sanitizeMatch(result.data)
      }
    } else if (result && !result.status) {
      return this.sanitizeMatch(result);
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

    if (match.liveStatus && Array.isArray(match.liveStatus.innings)) {
        const t1Id = match.teamAId?._id?.toString() || match.teamAId?.toString();
        const t2Id = match.teamBId?._id?.toString() || match.teamBId?.toString();

        let team1Runs = 0; let team1Wickets = 0; let team1Balls = 0;
        let team2Runs = 0; let team2Wickets = 0; let team2Balls = 0;
        
        match.liveStatus.innings.forEach((inn: any) => {
            const batId = inn.battingTeamId?.toString();
            if (batId === t1Id) {
                team1Runs += inn.totalRuns || 0;
                team1Wickets = inn.totalWickets || 0;
                team1Balls += inn.totalBalls || 0;
            } else if (batId === t2Id) {
                team2Runs += inn.totalRuns || 0;
                team2Wickets = inn.totalWickets || 0;
                team2Balls += inn.totalBalls || 0;
            }
        });

        if (team1Balls > 0) {
           team1Score = `${team1Runs}/${team1Wickets}`;
           const overs = Math.floor(team1Balls / 6);
           const balls = team1Balls % 6;
           team1Overs = `${overs}.${balls}`;
        }
        if (team2Balls > 0) {
           team2Score = `${team2Runs}/${team2Wickets}`;
           const overs = Math.floor(team2Balls / 6);
           const balls = team2Balls % 6;
           team2Overs = `${overs}.${balls}`;
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
          name: getName(match.teamAId, 'Team A'), 
          code: getCode(match.teamAId, 'T1'),
          score: team1Score,
          overs: team1Overs
      },
      team2: { 
          name: getName(match.teamBId, 'Team B'), 
          code: getCode(match.teamBId, 'T2'),
          score: team2Score,
          overs: team2Overs
      },
      status: displayStatus,
      venue: getName(match.venueId, 'Unknown Venue'),
      time: match.matchTime || match.matchDate,
      runRate: runRate,
      result: resultString
    };
  }
}
