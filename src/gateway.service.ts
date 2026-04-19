import { Injectable, HttpException, HttpStatus, Logger } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { Request } from 'express';
import { firstValueFrom } from 'rxjs';
import { MainAppService } from './services/main-app.service';

@Injectable()
export class GatewayService {
  private readonly logger = new Logger(GatewayService.name);
  private readonly socketServiceUrl = process.env.SOCKET_SERVICE_URL || 'http://localhost:3002';

  constructor(
    private readonly httpService: HttpService,
    private readonly mainAppService: MainAppService,
  ) { }

  async proxyRequest(req: Request) {
    try {
      const path = req.path.replace('/api', '');
      const targetService = this.getTargetService(path);

      this.logger.debug(`Routing ${req.method} ${path} to ${targetService}`);

      if (targetService === 'main-app') {
        // Use TCP microservice for main-app
        return this.handleMainAppRequest(req, path);
      } else if (targetService === 'socket-service') {
        // Use HTTP for socket service (if needed)
        return this.handleSocketServiceRequest(req, path);
      } else {
        throw new HttpException('Service not found', HttpStatus.NOT_FOUND);
      }
    } catch (error: any) {
      this.logger.error(`Gateway error: ${error?.message || error}`);

      if (error instanceof HttpException) {
        throw error;
      }

      throw new HttpException(
        error.message || 'Gateway error',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  private async handleMainAppRequest(req: Request, path: string) {
    const routePattern = this.pathToMessagePattern(path, req.method);

    this.logger.log(`Routing ${req.method} ${path} -> ${routePattern}`);

    if (!routePattern) {
      throw new HttpException(
        `No route pattern found for ${req.method} ${path}`,
        HttpStatus.NOT_FOUND,
      );
    }

    // Prepare data based on route pattern and method
    let data: any;
    const pathParts = path.split('/').filter(Boolean);

    // Remove 'admin' prefix if present
    if (pathParts[0] === 'admin') {
      pathParts.shift();
    }

    // Handle live-match specific data formatting
    if (routePattern.startsWith('live-match.')) {
      const matchId = pathParts[1]; // matches/:id/...

      if (routePattern === 'live-match.getRecentOvers' || routePattern === 'live-match.get-partnerships') {
        data = {
          matchId,
          inningNumber: req.query.inningNumber ? parseInt(req.query.inningNumber as string) : undefined
        };
      } else if (routePattern === 'live-match.getScorecard') {
        // Handle both /innings and /scorecard/:inningNumber
        let inningNumber = 1; // default

        if (pathParts[2] === 'scorecard' && pathParts[3]) {
          // /matches/:id/scorecard/:inningNumber
          inningNumber = parseInt(pathParts[3]) || 1;
        } else if (pathParts[2] === 'innings') {
          // /matches/:id/innings -> default to inning 1
          inningNumber = 1;
        } else if (req.query.inningNumber) {
          // Query parameter
          inningNumber = parseInt(req.query.inningNumber as string) || 1;
        }

        data = {
          matchId,
          inningNumber
        };
        this.logger.log(`Formatted scorecard data:`, JSON.stringify(data));
      } else if (routePattern === 'live-match.updateInning') {
        // Handle /matches/:id/scorecard/:inningNumber/inning
        const inningNumber = parseInt(pathParts[3]) || 1;
        data = {
          matchId,
          inningNumber,
          updateDto: req.body
        };
      } else if (routePattern === 'live-match.updateLiveStatus') {
        // Handle /matches/:id/live-status PUT
        data = {
          matchId,
          updateDto: req.body
        };
      } else if (
        // Simple GET routes that receive only the matchId string
        routePattern === 'live-match.getSquads' ||
        routePattern === 'live-match.getStatus' ||
        routePattern === 'live-match.getSessions' ||
        routePattern === 'live-match.getAllInnings' ||
        routePattern === 'live-match.evaluateMatchOutcome'
      ) {
        data = matchId; // send plain string
      } else {
        // For mutation routes (event, simple-event, etc.), include body
        data = {
          matchId,
          ...req.body
        };
      }
    } else {
      // Standard CRUD data formatting
      if (req.method === 'GET') {
        const lastPart = pathParts[pathParts.length - 1];
        const resourceNames = ['venues', 'teams', 'players', 'matches', 'umpires', 'series'];
        if (lastPart && !resourceNames.includes(lastPart.toLowerCase()) && Object.keys(req.query).length === 0) {
          data = lastPart; // It's an ID
        } else {
          data = req.query; // Use query params
        }
      } else if (req.method === 'POST') {
        data = req.body;
      } else if (req.method === 'PUT') {
        const id = pathParts[pathParts.length - 1];
        if (id) {
          data = { id, updateVenueDto: req.body };
        } else {
          data = req.body;
        }
      } else if (req.method === 'DELETE') {
        const id = pathParts[pathParts.length - 1];
        data = id || req.body;
      }
    }

    try {
      const result = await this.mainAppService.send(routePattern, data);
      this.logger.log(`Successfully sent ${routePattern} with data:`, JSON.stringify(data));
      return result;
    } catch (error: any) {
      this.logger.error(`Main-app service error for ${routePattern}:`, error?.message || error);
      this.logger.error(`Data sent:`, JSON.stringify(data));
      this.logger.error(`Path: ${path}, Method: ${req.method}`);

      if (error?.status === 404 || error?.message?.includes('not found')) {
        throw new HttpException(error.message || 'Resource not found', HttpStatus.NOT_FOUND);
      }

      throw new HttpException(
        error?.message || 'Internal server error',
        error?.status || HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  private async handleSocketServiceRequest(req: Request, path: string) {
    // HTTP proxy for socket service (if needed in future)
    const targetUrl = `${this.socketServiceUrl}${path}`;

    const response = await firstValueFrom(
      this.httpService.request({
        method: req.method as any,
        url: targetUrl,
        data: req.body,
        headers: {
          ...req.headers,
          host: undefined,
        },
        params: req.query,
      }),
    );

    // Return data instead of sending response directly
    return response.data;
  }

  private getTargetService(path: string): string {
    // Route socket-related requests to socket service
    if (path.startsWith('/socket') || path.startsWith('/live')) {
      return 'socket-service';
    }
    // All other requests go to main app via TCP
    return 'main-app';
  }

  private pathToMessagePattern(path: string, method: string): string | null {
    // Convert HTTP path to microservice message pattern
    const pathParts = path.split('/').filter(Boolean);

    // Remove 'admin' prefix if present
    if (pathParts[0] === 'admin') {
      pathParts.shift();
    }

    if (pathParts.length === 0) {
      return null;
    }

    const resource = pathParts[0]; // e.g., 'venues', 'matches'

    // Handle special live-match routes
    if (resource === 'matches' && pathParts.length >= 3) {
      const subResource = pathParts[2];

      // Handle /matches/:id/innings -> use getAllInnings
      if (subResource === 'innings') {
        return 'live-match.getAllInnings';
      }

      // Handle /matches/:id/scorecard routes
      if (subResource === 'scorecard') {
        // Check for /matches/:id/scorecard/:inningNumber/inning PUT
        if (pathParts.length >= 5 && pathParts[4] === 'inning' && method === 'PUT') {
          return 'live-match.updateInning';
        }
        // Default scorecard route
        return 'live-match.getScorecard';
      }

      // Map other sub-resources to live-match patterns
      const liveMatchRoutes: Record<string, string> = {
        'live-status': method === 'PUT' ? 'live-match.updateLiveStatus' : 'live-match.getStatus',
        'recent-overs': 'live-match.getRecentOvers',
        'partnerships': 'live-match.get-partnerships',
        'squads': 'live-match.getSquads',
        'sessions': 'live-match.getSessions',
        'set-current-bowler': 'live-match.setCurrentBowler',
        'set-striker': 'live-match.setStriker',
        'set-non-striker': 'live-match.setNonStriker',
        'swap-batsmen': 'live-match.swapBatsmen',
        'evaluate': 'live-match.evaluateMatchOutcome',
        'super-over': 'live-match.startSuperOver',
        'event': 'live-match.handleEvent',
        'simple-event': 'live-match.handleSimpleEvent',
      };

      if (liveMatchRoutes[subResource]) {
        return liveMatchRoutes[subResource];
      }


    }

    // Standard CRUD operations
    const resourceNames = ['venues', 'teams', 'players', 'matches', 'umpires', 'series'];
    const lastPart = pathParts[pathParts.length - 1];
    const hasId = pathParts.length > 1 && lastPart && !resourceNames.includes(lastPart.toLowerCase());

    const methodMap: Record<string, string> = {
      GET: hasId ? 'findOne' : 'findAll',
      POST: 'create',
      PUT: 'update',
      DELETE: 'remove',
    };

    const action = methodMap[method];
    if (!action) {
      return null;
    }

    return `${resource}.${action}`;
  }
}

