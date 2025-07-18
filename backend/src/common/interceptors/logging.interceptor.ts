import {
    Injectable,
    NestInterceptor,
    ExecutionContext,
    CallHandler,
    Logger,
  } from '@nestjs/common';
  import { Observable } from 'rxjs';
  import { tap } from 'rxjs/operators';
  
  @Injectable()
  export class LoggingInterceptor implements NestInterceptor {
    private readonly logger = new Logger(LoggingInterceptor.name);
  
    intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
      const request = context.switchToHttp().getRequest();
      const { method, url, body } = request;
      const startTime = Date.now();
  
      this.logger.log(`${method} ${url} - Request started`);
  
      return next.handle().pipe(
        tap(() => {
          const endTime = Date.now();
          const duration = endTime - startTime;
          this.logger.log(`${method} ${url} - Completed in ${duration}ms`);
        }),
      );
    }
  }