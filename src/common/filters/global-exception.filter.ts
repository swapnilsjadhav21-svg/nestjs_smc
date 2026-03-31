import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  HttpException,
  HttpStatus,
  Logger,
} from '@nestjs/common';
import { QueryFailedError } from 'typeorm';

@Catch()
export class GlobalExceptionFilter implements ExceptionFilter {
  private readonly logger = new Logger(GlobalExceptionFilter.name);

  catch(exception: unknown, host: ArgumentsHost): void {
    const ctx = host.switchToHttp();
    const request = ctx.getRequest();
    const response = ctx.getResponse();
    const isDev = process.env.NODE_ENV === 'development';

    let statusCode = HttpStatus.INTERNAL_SERVER_ERROR;
    let message = 'Internal server error';
    let details: unknown = null;
    let stack: string | undefined;

    if (exception instanceof HttpException) {
      statusCode = exception.getStatus();
      message = exception.message;

      const exceptionResponse = exception.getResponse();
      if (
        typeof exceptionResponse === 'object' &&
        exceptionResponse !== null &&
        'message' in exceptionResponse
      ) {
        const responseMessage = (exceptionResponse as { message?: unknown }).message;
        if (Array.isArray(responseMessage)) {
          details = responseMessage;
        } else if (responseMessage) {
          details = responseMessage;
        }
      } else if (typeof exceptionResponse === 'string') {
        details = exceptionResponse;
      }

      stack = exception.stack;
    } else if (exception instanceof QueryFailedError) {
      statusCode = HttpStatus.INTERNAL_SERVER_ERROR;
      message = 'Database error occurred';
      details = isDev ? exception.message : null;
      stack = exception.stack;
    } else if (exception instanceof Error) {
      statusCode = HttpStatus.INTERNAL_SERVER_ERROR;
      message = 'Internal server error';
      details = isDev ? exception.stack ?? exception.message : null;
      stack = exception.stack;
    } else {
      statusCode = HttpStatus.INTERNAL_SERVER_ERROR;
      message = 'Internal server error';
      details = isDev ? String(exception) : null;
    }

    const errorMessage = exception instanceof Error ? exception.message : String(exception);
    this.logger.error(
      `[${request.method}] ${request.url} - ${errorMessage}`,
      isDev ? stack : undefined,
    );

    response.status(statusCode).json({
      success: false,
      message,
      data: null,
      error: {
        statusCode,
        details,
      },
    });
  }
}