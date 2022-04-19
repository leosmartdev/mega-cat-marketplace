import { Route } from '@angular/router';
import { SignInComponent } from 'app/modules/bookcoin/auth/sign-in/sign-in.component';

export const signInRoutes: Route[] = [
  {
    path: '',
    component: SignInComponent
  }
];
