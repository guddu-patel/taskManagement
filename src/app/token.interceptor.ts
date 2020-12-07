import { Injectable } from '@angular/core';
import {
  HttpRequest,
  HttpHandler,
  HttpEvent,
  HttpInterceptor
} from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable()
export class TokenInterceptor implements HttpInterceptor {

  constructor() { }

  intercept(req: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    const userToken = 'WSGgU3GRlTggnfRDDSoSCmHXHdtvhMiw';
    const modifiedReq = req.clone({
      headers: req.headers.set('AuthToken', userToken),
    });
    return next.handle(modifiedReq);
  }
}
