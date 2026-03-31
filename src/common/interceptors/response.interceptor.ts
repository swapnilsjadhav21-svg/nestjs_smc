import {
  CallHandler,
  ExecutionContext,
  Injectable,
  NestInterceptor,
  StreamableFile,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

@Injectable()
export class ResponseInterceptor implements NestInterceptor {
  intercept(context: ExecutionContext, next: CallHandler): Observable<unknown> {
    const response = context.switchToHttp().getResponse();

    return next.handle().pipe(
      map((data: unknown) => {
        // Do not wrap file/stream responses.
        if (data instanceof StreamableFile) {
          return data;
        }

        if (data && typeof data === 'object' && 'pipe' in (data as object)) {
          return data;
        }

        const contentDisposition = response?.getHeader?.('content-disposition');
        if (typeof contentDisposition === 'string' && contentDisposition.length > 0) {
          return data;
        }

        // Avoid double wrapping if response is already in standard shape.
        if (data && typeof data === 'object' && 'success' in (data as object)) {
          return data;
        }

        return {
          success: true,
          message: 'Success',
          data,
          error: null,
        };
      }),
    );
  }
}