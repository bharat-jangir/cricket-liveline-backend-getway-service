import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
  Logger,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { tap, catchError } from 'rxjs/operators';
import { throwError } from 'rxjs';
import { Request, Response } from 'express';
import { LoggerService } from '../services/logger.service';

@Injectable()
export class LoggingInterceptor implements NestInterceptor {
  private readonly logger = new Logger(LoggingInterceptor.name);

  constructor(private loggerService: LoggerService) {}

  async intercept(context: ExecutionContext, next: CallHandler): Promise<Observable<any>> {
    const request = context.switchToHttp().getRequest<Request>();
    const response = context.switchToHttp().getResponse<Response>();
    const startTime = Date.now();

    // Skip logging for health checks or specific paths if needed
    if (request.path === '/health' || request.path === '/api/health') {
      return next.handle();
    }

    // Create initial log entry and get MongoDB _id as logoId
    let logoId: string = '';
    
    try {
      this.logger.log(`[REQUEST] ${request.method} ${request.path} - Creating log entry`);
      logoId = await this.loggerService.createInitialLog({
        method: request.method,
        path: request.path,
        query: request.query as Record<string, any>,
        body: this.sanitizeBody(request.body),
        params: request.params,
        headers: this.sanitizeHeaders(request.headers),
        ipAddress: request.ip || (Array.isArray(request.headers['x-forwarded-for']) ? request.headers['x-forwarded-for'][0] : request.headers['x-forwarded-for']) || 'unknown',
        userAgent: request.headers['user-agent'] || 'unknown',
        userId: (request as any).user?.id,
      });
      
      if (logoId && typeof logoId === 'string' && logoId.trim() !== '') {
        this.logger.log(`[LOG CREATED] ${request.method} ${request.path} - logoId: ${logoId}`);
        // Store logoId in request for later use
        (request as any).logoId = logoId;
        this.logger.log(`[LOG CREATED] ${request.method} ${request.path} - logoId stored in request: ${(request as any).logoId}`);
        this.logger.log(`[LOG CREATED] ${request.method} ${request.path} - Verification - request.logoId is set: ${!!(request as any).logoId}`);
      } else {
        this.logger.warn(`[LOG FAILED] ${request.method} ${request.path} - Failed to create log entry, logoId is empty or invalid. Received: ${logoId}`);
        // Even if empty, still set it
        (request as any).logoId = null;
      }
    } catch (err: any) {
      this.logger.error(`[LOG ERROR] ${request.method} ${request.path} - Failed to create initial log: ${err.message}`, err.stack);
    }

    return next.handle().pipe(
      tap((data) => {
        const responseTime = Date.now() - startTime;
        // Get statusCode from data first (set by controller), then response object, or default to 200
        // When using @Res(), response.statusCode is set by res.status() call
        const statusCode = data?.statusCode || response.statusCode || 200;
        const finalLogoId = (request as any).logoId || logoId;

        if (finalLogoId) {
          this.logger.log(`[LOG UPDATE] ${request.method} ${request.path} - Updating log ${finalLogoId} with status ${statusCode} (${responseTime}ms)`);
          this.loggerService.updateLog({
            logoId: finalLogoId,
            statusCode,
            response: this.sanitizeResponse(data),
            responseHeaders: this.sanitizeHeaders(response.getHeaders()),
            userMessage: data?.userMessage || data?.response?.userMessage,
            userMessageCode: data?.userMessageCode || data?.response?.userMessageCode,
            developerMessage: data?.developerMessage || data?.response?.developerMessage,
            responseTime,
            error: data?.status === false || data?.response?.status === false ? {
              message: data?.developerMessage || data?.response?.developerMessage,
              code: data?.userMessageCode || data?.response?.userMessageCode,
            } : undefined,
          }).catch((err) => {
            this.logger.error(`[LOG UPDATE ERROR] ${request.method} ${request.path} - Failed to update log: ${err.message}`, err.stack);
          });
        } else {
          this.logger.warn(`[LOG UPDATE WARN] ${request.method} ${request.path} - Cannot update log - logoId is empty`);
        }
        // ResponseInterceptor will read logoId from request.logoId
      }),
      catchError((error) => {
        const responseTime = Date.now() - startTime;
        const statusCode = error.status || 500;
        const finalLogoId = (request as any).logoId || logoId;

        if (finalLogoId) {
          this.logger.error(`[LOG ERROR UPDATE] ${request.method} ${request.path} - Updating error log ${finalLogoId} with status ${statusCode} (${responseTime}ms)`);
          this.loggerService.updateLog({
            logoId: finalLogoId,
            statusCode,
            response: error.response || { status: false, message: error.message },
            responseHeaders: this.sanitizeHeaders(response.getHeaders()),
            userMessage: error.response?.userMessage || 'Internal server error',
            userMessageCode: error.response?.userMessageCode || 'INTERNAL_ERROR',
            developerMessage: error.response?.developerMessage || error.message,
            responseTime,
            error: {
              message: error.message,
              stack: error.stack,
              code: error.code,
            },
          }).catch((err) => {
            this.logger.error(`[LOG ERROR UPDATE FAILED] ${request.method} ${request.path} - Failed to update error log: ${err.message}`);
          });
        } else {
          this.logger.warn(`[LOG ERROR UPDATE WARN] ${request.method} ${request.path} - Cannot update error log - logoId is empty`);
        }

        return throwError(() => error);
      }),
    );
  }

  private sanitizeBody(body: any): any {
    if (!body) return body;
    
    // Remove sensitive fields
    const sensitiveFields = ['password', 'token', 'authorization', 'creditCard', 'ssn'];
    const sanitized = { ...body };
    
    for (const field of sensitiveFields) {
      if (sanitized[field]) {
        sanitized[field] = '***REDACTED***';
      }
    }
    
    return sanitized;
  }

  private sanitizeResponse(response: any): any {
    if (!response) return response;
    
    // Limit response size for logging (prevent huge responses)
    if (typeof response === 'object') {
      const stringified = JSON.stringify(response);
      if (stringified.length > 10000) {
        return { ...response, _truncated: true, _originalSize: stringified.length };
      }
    }
    
    return response;
  }

  private sanitizeHeaders(headers: any): Record<string, any> {
    if (!headers) return {};
    
    const sanitized: Record<string, any> = {};
    const sensitiveHeaders = ['authorization', 'cookie', 'x-api-key', 'x-auth-token', 'x-access-token'];
    
    for (const key in headers) {
      if (sensitiveHeaders.includes(key.toLowerCase())) {
        sanitized[key] = '***REDACTED***';
      } else {
        sanitized[key] = headers[key];
      }
    }
    
    return sanitized;
  }
}
