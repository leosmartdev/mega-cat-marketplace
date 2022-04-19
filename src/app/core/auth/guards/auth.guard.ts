import { Injectable } from '@angular/core';
import { ActivatedRouteSnapshot, CanActivate, CanActivateChild, CanLoad, Route, Router, RouterStateSnapshot, UrlSegment, UrlTree } from '@angular/router';
import { Observable, of } from 'rxjs';
import { AuthService } from 'app/core/auth/auth.service';
import { switchMap } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class AuthGuard implements CanActivate, CanActivateChild, CanLoad {
  /**
   * Constructor
   */
  constructor(private authService: AuthService, private router: Router) {}

  // -----------------------------------------------------------------------------------------------------
  // @ Public methods
  // -----------------------------------------------------------------------------------------------------

  /**
   * Can activate
   *
   * @param route
   * @param state
   */
  canActivate(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): Observable<boolean> | Promise<boolean> | boolean {
    const redirectUrl = state.url === '/sign-out' ? '/' : state.url;
    return this._check(redirectUrl, route);
  }

  /**
   * Can activate child
   *
   * @param childRoute
   * @param state
   */
  canActivateChild(childRoute: ActivatedRouteSnapshot, state: RouterStateSnapshot): Observable<boolean | UrlTree> | Promise<boolean | UrlTree> | boolean | UrlTree {
    const redirectUrl = state.url === '/sign-out' ? '/' : state.url;
    return this._check(redirectUrl, childRoute);
  }

  /**
   * Can load
   *
   * @param route
   * @param segments
   */
  canLoad(route: Route, segments: UrlSegment[]): Observable<boolean> | Promise<boolean> | boolean {
    return this._check('/', null);
  }

  // -----------------------------------------------------------------------------------------------------
  // @ Private methods
  // -----------------------------------------------------------------------------------------------------

  /**
   * Role-based authorization, verifies if a user has the proper role for the route.
   *
   * @param route
   * @private
   */
  private _checkRole(route: ActivatedRouteSnapshot) {
    const user = this.authService.user;
    if (user) {
      if (route.data.roles && route.data.roles.indexOf(user.role) === -1) {
        return false;
      }

      return true;
    }
  }

  /**
   * Check the authenticated status
   *
   * @param redirectURL
   * @private
   */
  private _check(redirectURL: string, route: ActivatedRouteSnapshot): Observable<boolean> {
    // Check the authentication status
    return this.authService.check().pipe(
      switchMap((authenticated) => {
        // If the user is not authenticated...
        if (!authenticated) {
          // Redirect to the sign-in page
          this.router.navigate(['sign-in'], { queryParams: { redirectURL } });

          // Prevent the access
          return of(false);
        }
        if (route && !this._checkRole(route)) {
          this.router.navigate(['market'], { queryParams: { redirectURL } });
        }

        // Allow the access
        return of(true);
      })
    );
  }
}
