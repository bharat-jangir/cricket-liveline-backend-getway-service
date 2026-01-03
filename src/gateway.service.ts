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
  ) {}

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
    // Extract route pattern from path
    // e.g., /admin/venues -> venues.findAll or venues.create
    const routePattern = this.pathToMessagePattern(path, req.method);
    
    if (!routePattern) {
      throw new HttpException(
        `No route pattern found for ${req.method} ${path}`,
        HttpStatus.NOT_FOUND,
      );
    }

    // Prepare data based on method
    let data: any;
    const pathParts = path.split('/').filter(Boolean);
    
    if (req.method === 'GET') {
      // Check if there's an ID in the path (last segment)
      const lastPart = pathParts[pathParts.length - 1];
      // If last part looks like an ID (not a query param key) and no query params
      if (lastPart && !req.query[lastPart] && Object.keys(req.query).length === 0) {
        // Might be an ID, but let's check if it's a known resource name
        const resourceNames = ['venues', 'teams', 'players', 'matches']; // Add more as needed
        if (!resourceNames.includes(lastPart.toLowerCase())) {
          data = lastPart; // It's an ID
        } else {
          data = req.query; // It's a resource, use query params
        }
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

    try {
      const result = await this.mainAppService.send(routePattern, data);
      // Return data instead of sending response directly
      // This allows ResponseInterceptor to work
      return result;
    } catch (error: any) {
      this.logger.error(`Main-app service error: ${error?.message || error}`);
      
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
    // /admin/venues -> venues.*
    // /admin/venues/:id -> venues.findOne/update/remove
    
    const pathParts = path.split('/').filter(Boolean);
    
    // Remove 'admin' prefix if present
    if (pathParts[0] === 'admin') {
      pathParts.shift();
    }
    
    if (pathParts.length === 0) {
      return null;
    }
    
    const resource = pathParts[0]; // e.g., 'venues'
    const hasId = pathParts.length > 1 && pathParts[pathParts.length - 1];
    
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

