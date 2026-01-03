import { Injectable, Logger } from '@nestjs/common';
import { MainAppService } from '../../services/main-app.service';

export interface CreateInitialLogParams {
  method: string;
  path: string;
  query?: Record<string, any>;
  body?: Record<string, any>;
  params?: Record<string, any>;
  headers?: Record<string, any>;
  ipAddress?: string;
  userAgent?: string;
  userId?: string;
}

export interface UpdateLogParams {
  logoId: string;
  statusCode: number;
  response?: any;
  responseHeaders?: Record<string, any>;
  userMessage?: string;
  userMessageCode?: string;
  developerMessage?: string;
  responseTime?: number;
  error?: {
    message?: string;
    stack?: string;
    code?: string;
  };
}

@Injectable()
export class LoggerService {
  private readonly logger = new Logger(LoggerService.name);

  constructor(private mainAppService: MainAppService) {}

  async createInitialLog(params: CreateInitialLogParams): Promise<string> {
    try {
      this.logger.log(`[LOGGER SERVICE] Sending log creation request to main-app for ${params.method} ${params.path}`);
      const logoId = await this.mainAppService.send('logs.createInitial', params);
      this.logger.log(`[LOGGER SERVICE] Raw response from main-app: ${JSON.stringify(logoId)}, type: ${typeof logoId}`);
      
      // Handle different response types
      let logoIdString = '';
      if (typeof logoId === 'string') {
        logoIdString = logoId;
      } else if (logoId && typeof logoId === 'object' && logoId.toString) {
        logoIdString = logoId.toString();
      } else if (logoId) {
        logoIdString = String(logoId);
      }
      
      if (logoIdString && logoIdString.trim() !== '') {
        this.logger.log(`[LOGGER SERVICE] Received logoId from main-app: ${logoIdString}`);
      } else {
        this.logger.warn(`[LOGGER SERVICE] Received empty or invalid logoId from main-app for ${params.method} ${params.path}. Raw response: ${JSON.stringify(logoId)}`);
      }
      return logoIdString;
    } catch (error: any) {
      this.logger.error(`[LOGGER SERVICE ERROR] Failed to create initial log for ${params.method} ${params.path}: ${error?.message || error}`, error?.stack);
      return '';
    }
  }

  async updateLog(params: UpdateLogParams): Promise<void> {
    try {
      this.logger.log(`[LOGGER SERVICE] Updating log ${params.logoId} with status ${params.statusCode}`);
      await this.mainAppService.send('logs.update', {
        logoId: params.logoId,
        logData: {
          statusCode: params.statusCode,
          response: params.response,
          responseHeaders: params.responseHeaders,
          userMessage: params.userMessage,
          userMessageCode: params.userMessageCode,
          developerMessage: params.developerMessage,
          responseTime: params.responseTime,
          error: params.error,
        },
      });
      this.logger.log(`[LOGGER SERVICE] Successfully updated log ${params.logoId}`);
    } catch (error: any) {
      // Silently fail to prevent breaking the main flow
      this.logger.error(`[LOGGER SERVICE ERROR] Failed to update log ${params.logoId}: ${error?.message || error}`, error?.stack);
    }
  }
}

