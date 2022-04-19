import { Injectable } from '@angular/core';
import { HttpErrorResponse, HttpEvent, HttpHandler, HttpInterceptor, HttpRequest } from '@angular/common/http';
import { BehaviorSubject, Observable, throwError } from 'rxjs';
import { catchError, filter, switchMap, take } from 'rxjs/operators';
import { AuthService } from 'app/core/auth/auth.service';
import { Router } from '@angular/router';

@Injectable()
export class AuthInterceptor implements HttpInterceptor {
  private isRefreshing = false;
  private refreshTokenSubject: BehaviorSubject<any> = new BehaviorSubject<any>(null);

  /**
   * Constructor
   */
  constructor(private authService: AuthService, private router: Router) {}

  /**
   * Intercept
   *
   * @param req
   * @param next
   */
  intercept(req: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    // UPDATE
    // In this application, all request are not guarded with access token, don't need to explicitly put auth header
    // Currently, all requests which are making API calls to protected routes, they are using authService.getAuthHeader()
    //
    // Here, just to handle responses with 401 Unauthorized HTTP Code, with
    // - refresh tokens and
    // - re-execute original request with new access token

    const authRoutes = (url: string) => ['auth/refreshToken'].some((authRoute) => url.includes(authRoute));

    return next.handle(req).pipe(
      catchError((error) => {
        if (error instanceof HttpErrorResponse && error.status === 401) {
          if (authRoutes(req.url)) {
            this.authService.signOut();
            this.router.navigate(['/sign-in']);
            return throwError(error);
          }
          return this.handleUnauthorizedError(req, next);
        }
        return throwError(error);
      })
    );
  }

  private handleUnauthorizedError(request: HttpRequest<any>, next: HttpHandler) {
    if (!this.isRefreshing) {
      this.isRefreshing = true;
      this.refreshTokenSubject.next(null);
      return this.authService.refreshTokens().pipe(
        switchMap((res: any) => {
          this.isRefreshing = false;
          this.refreshTokenSubject.next(res.accessToken);

          return next.handle(this.addTokenHeader(request));
        }),
        catchError((err) => {
          this.isRefreshing = false;

          this.authService.signOut();
          this.router.navigate(['/sign-in']);
          return throwError(err);
        })
      );
    }
    return this.refreshTokenSubject.pipe(
      filter((token) => token !== null),
      take(1),
      switchMap(() => next.handle(this.addTokenHeader(request)))
    );
  }

  private addTokenHeader(request: HttpRequest<any>) {
    return request.clone({ headers: this.authService.getAuthHeader() });
  }
}
