import { Injectable } from '@angular/core';
import { HttpInterceptor, HttpEvent, HttpResponse, HttpRequest, HttpHandler } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map, filter } from 'rxjs/operators';
import { AuthService } from './core/auth/auth.service';

@Injectable()
export class HeaderInterceptor implements HttpInterceptor {
  constructor(private _authService: AuthService) {}
  intercept(req: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    if (this._authService.accessToken) {
      /* const cloned = req.clone({
            headers: req.headers.set('Authorization', 'Bearer ' + this._authService.accessToken)
        });

        return next.handle(cloned); */
      return next.handle(req);
    } else {
      return next.handle(req);
    }
  }
}
