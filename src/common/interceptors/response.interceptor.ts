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
    
    return next.handle().pipe(
      map((data) => {
        // Get logoId from request (set by LoggingInterceptor)
        const logoId = (request as any).logoId || null;
        
        // If data has a 'response' wrapper, flatten it
        if (data && typeof data === 'object' && 'response' in data) {
          return {
            logoId,
            ...data.response  // Flatten the response wrapper
          };
        }
        
        // Just add logoId to the response and return as-is
        if (data && typeof data === 'object') {
          return {
            logoId,
            ...data
          };
        }
        
        return {
          logoId,
          data
        };
      }),
    );
  }
}

