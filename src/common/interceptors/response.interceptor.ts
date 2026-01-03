import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
  HttpCode,
  HttpStatus,
  Logger,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { Request, Response } from 'express';
import { Reflector } from '@nestjs/core';

@Injectable()
export class ResponseInterceptor implements NestInterceptor {
  private readonly logger = new Logger(ResponseInterceptor.name);

  constructor(private reflector: Reflector) {}

  intercept(
    context: ExecutionContext,
    next: CallHandler,
  ): Observable<any> {
    const request = context.switchToHttp().getRequest<Request>();
    const response = context.switchToHttp().getResponse<Response>();
    
    // Get status code from @HttpCode decorator if present
    const httpCode = this.reflector.get<number>(HttpCode, context.getHandler());
    const defaultStatusCode = httpCode || response.statusCode || HttpStatus.OK;
    
    return next.handle().pipe(
      map((data) => {
        // Get logoId from request (set by LoggingInterceptor)
        const logoId = (request as any).logoId || null;
        
        this.logger.log(`[RESPONSE] ${request.method} ${request.path} - request.logoId: "${(request as any).logoId}", logoId: "${logoId}"`);
        this.logger.log(`[RESPONSE] ${request.method} ${request.path} - request object keys: ${Object.keys(request).join(', ')}`);
        
        // Determine statusCode - prioritize data.statusCode, then httpCode decorator, then response.statusCode
        let statusCode = defaultStatusCode;
        if (data && typeof data === 'object' && 'statusCode' in data) {
          statusCode = data.statusCode;
        } else if (httpCode) {
          statusCode = httpCode;
        }
        
        // Set response status code
        response.statusCode = statusCode;
        
        // If data already has standardized structure (from main-app), use it and add logoId
        if (data && typeof data === 'object' && 'status' in data && 'data' in data) {
          const finalResponse = {
            logoId,
            statusCode: data.statusCode || statusCode,
            status: data.status,
            userMessage: data.userMessage,
            userMessageCode: data.userMessageCode,
            developerMessage: data.developerMessage,
            data: data.data,
          };
          this.logger.log(`[RESPONSE] Final response keys: ${Object.keys(finalResponse).join(', ')}, logoId value: "${finalResponse.logoId}"`);
          return finalResponse;
        }
        
        // If data has statusCode and userMessage (from controller wrapper), use them
        if (data && typeof data === 'object' && 'statusCode' in data && 'userMessage' in data) {
          return {
            logoId,
            statusCode: data.statusCode || statusCode,
            status: data.status !== undefined ? data.status : true,
            userMessage: data.userMessage,
            userMessageCode: data.userMessageCode,
            developerMessage: data.developerMessage,
            data: data.data || data,
          };
        }
        
        // Default: wrap plain data
        return {
          logoId,
          statusCode,
          status: true,
          userMessage: data?.userMessage || 'Request successful',
          userMessageCode: data?.userMessageCode || 'SUCCESS',
          developerMessage: data?.developerMessage || 'Request completed successfully',
          data: data?.data ?? data ?? {},
        };
      }),
    );
  }
}

