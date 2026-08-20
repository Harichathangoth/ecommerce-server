import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpException,
  HttpStatus,
  Logger,
} from '@nestjs/common';
import { FastifyReply, FastifyRequest } from 'fastify';
import { QueryFailedError } from 'typeorm';
import { ERROR_CODES } from '../constants/error-codes.constants';
import { ApiErrorResponse } from '../interfaces/api-response.interface';

@Catch()
export class AllExceptionsFilter implements ExceptionFilter {
  private readonly logger = new Logger(AllExceptionsFilter.name);

  catch(exception: unknown, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<FastifyReply>();
    const request = ctx.getRequest<FastifyRequest>();

    let statusCode = HttpStatus.INTERNAL_SERVER_ERROR;
    let message = 'An unexpected internal server error occurred';
    let errorCategory = 'Internal Server Error';
    let errorCode: string = ERROR_CODES.INTERNAL_SERVER_ERROR;
    let fieldErrors: { field: string; message: string }[] | undefined = undefined;

    // 1. NestJS Built-in HTTP Exceptions & ValidationPipe
    if (exception instanceof HttpException) {
      statusCode = exception.getStatus();
      const resResponse: any = exception.getResponse();

      if (typeof resResponse === 'string') {
        message = resResponse;
      } else if (typeof resResponse === 'object') {
        message = resResponse.message || exception.message;
        errorCategory = resResponse.error || 'Http Exception';

        // Extract class-validator array outputs into field-level validation errors
        if (Array.isArray(resResponse.message)) {
          message = 'Input validation failed';
          errorCode = ERROR_CODES.VALIDATION_FAILED;
          fieldErrors = resResponse.message.map((msg: string) => {
            const parts = msg.split(' ');
            return {
              field: parts[0] || 'input',
              message: msg,
            };
          });
        }
      }
    }
    // 2. TypeORM Database Constraints (PostgreSQL Errors)
    else if (exception instanceof QueryFailedError) {
      const driverError = (exception as any).driverError;
      statusCode = HttpStatus.CONFLICT;
      errorCategory = 'Database Conflict';

      if (driverError?.code === '23505') {
        // Unique Constraint Violation
        message = 'A record with duplicate unique fields already exists';
        errorCode = ERROR_CODES.DATABASE_DUPLICATE_KEY;
      } else if (driverError?.code === '23503') {
        // Foreign Key Violation
        message = 'Referenced entity does not exist in database';
        errorCode = ERROR_CODES.DATABASE_FOREIGN_KEY_VIOLATION;
      }
    }

    // Log Error Contextually
    this.logger.error(
      `HTTP ${statusCode} Error on [${request.method}] ${request.url}: ${message}`,
      exception instanceof Error ? exception.stack : '',
    );

    // Build Standard Error JSON Envelope
    const errorResponse: ApiErrorResponse = {
      success: false,
      statusCode,
      message,
      error: errorCategory,
      errorCode,
      ...(fieldErrors && { errors: fieldErrors }),
      timestamp: new Date().toISOString(),
      path: request.url,
    };

    response.status(statusCode).send(errorResponse);
  }
}
