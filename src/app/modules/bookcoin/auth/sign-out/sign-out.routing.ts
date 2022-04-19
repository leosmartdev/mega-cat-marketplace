import { Route } from '@angular/router';
import { SignOutComponent } from 'app/modules/bookcoin/auth/sign-out/sign-out.component';

export const signOutRoutes: Route[] = [
  {
    path: '',
    component: SignOutComponent
  }
];
