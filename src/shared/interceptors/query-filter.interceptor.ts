import {
  CallHandler,
  ExecutionContext,
  Injectable,
  NestInterceptor,
} from '@nestjs/common';
import { Observable } from 'rxjs';

@Injectable()
export class QueryParamsFilterInterceptor implements NestInterceptor {
  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const http = context.switchToHttp();
    const request = http.getRequest();
    const query = request.query;

    if (query?.filterQuery) {
      request.query.filterQuery = JSON.parse(query.filterQuery);
    }
    return next.handle();
  }
}
