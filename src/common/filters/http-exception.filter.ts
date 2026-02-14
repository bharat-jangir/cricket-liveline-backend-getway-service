import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpException,
  HttpStatus,
  Logger,
} from '@nestjs/common';
import { Request, Response } from 'express';

@Catch()
export class HttpExceptionFilter implements ExceptionFilter {
  private readonly logger = new Logger(HttpExceptionFilter.name);

  catch(exception: any, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();
    const logoId = (request as any).logoId;

    const status =
      exception instanceof HttpException
        ? exception.getStatus()
        : HttpStatus.INTERNAL_SERVER_ERROR;

    const exceptionResponse =
      exception instanceof HttpException
        ? exception.getResponse()
        : null;

    // Extract message from exception
    let userMessage = 'Internal server error';
    let userMessageCode = 'INTERNAL_ERROR';
    let developerMessage = exception.message || 'Internal server error';

    if (exceptionResponse) {
      if (typeof exceptionResponse === 'string') {
        userMessage = exceptionResponse;
        developerMessage = exceptionResponse;
      } else if (typeof exceptionResponse === 'object') {
        const responseObj = exceptionResponse as any;
        let message = responseObj.message || responseObj.userMessage || userMessage;

        // Flatten message if it's an array (e.g. from ValidationPipe)
        if (Array.isArray(message)) {
          message = message.join(', ');
        }

        userMessage = responseObj.userMessage || message;
        userMessageCode = responseObj.userMessageCode || responseObj.error || userMessageCode;
        developerMessage = responseObj.developerMessage || message;
      }
    }

    // Log the error with full details
    this.logger.error(
      `[EXCEPTION] ${request.method} ${request.path} - Status: ${status}`,
    );
    this.logger.error(`Error Message: ${developerMessage}`);
    this.logger.error(`Error Stack: ${exception.stack || 'No stack trace available'}`);
    if (exception.name) {
      this.logger.error(`Error Name: ${exception.name}`);
    }
    if (exception.code) {
      this.logger.error(`Error Code: ${exception.code}`);
    }
    if (exception.response) {
      this.logger.error(`Error Response: ${JSON.stringify(exception.response, null, 2)}`);
    }

    // Check if headers have already been sent
    if (response.headersSent) {
      this.logger.warn(
        `[EXCEPTION] ${request.method} ${request.path} - Headers already sent, cannot send error response`,
      );
      return;
    }

    // Return standardized error response
    try {
      response.status(status).json({
        logoId: logoId || null,
        statusCode: status,
        status: false,
        userMessage,
        userMessageCode,
        developerMessage,
        data: null,
      });
    } catch (err: any) {
      this.logger.error(
        `[EXCEPTION] ${request.method} ${request.path} - Failed to send error response: ${err.message}`,
      );
    }
  }
}

