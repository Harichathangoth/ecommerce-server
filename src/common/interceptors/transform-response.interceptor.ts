import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { FastifyReply, FastifyRequest } from 'fastify';

@Injectable()
export class TransformResponseInterceptor<T> implements NestInterceptor<T, any> {
  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const ctx = context.switchToHttp();
    const response = ctx.getResponse<FastifyReply>();
    const request = ctx.getRequest<FastifyRequest>();

    return next.handle().pipe(
      map((data) => {
        // If data is already an envelope, return as-is
        if (data && typeof data === 'object' && 'success' in data) {
          return data;
        }

        // Separate metadata if present in payload
        let payload = data;
        let meta = undefined;
        if (data && typeof data === 'object' && 'items' in data && 'meta' in data) {
          payload = data.items;
          meta = data.meta;
        }

        return {
          success: true,
          statusCode: response.statusCode || 200,
          message: 'Operation executed successfully',
          data: payload,
          ...(meta && { meta }),
          timestamp: new Date().toISOString(),
          path: request.url,
        };
      }),
    );
  }
}
