import { Route } from '@angular/router';
import { Role } from './core/models/role';
import { WalletGuard } from './core/auth/guards/wallet.guard';
import { LandingLayoutComponent } from './modules/layout/landing-layout/landing-layout.component';
import { AuthGuard } from 'app/core/auth/guards/auth.guard';
import { NoAuthGuard } from 'app/core/auth/guards/noAuth.guard';
import { LayoutComponent } from 'app/layout/layout.component';
import { InitialDataResolver } from 'app/app.resolvers';
import { DropsComponent } from './feature/drops/drops.component';
import { LandingDropComponent } from './feature/drops/landing/landing.component';
import { SingleDropComponent } from './feature/drops/single-drop/single-drop.component';

const defaultMCLRedirectLandingPage: string = '/home';

export const mclRoutes: Route[] = [
  /* Standard routes
   * Routes that are to be accessible regardless of whether a user is logged in or not.
   */
  {
    path: '',
    component: LandingLayoutComponent,
    children: [
      { path: '', pathMatch: 'full', redirectTo: defaultMCLRedirectLandingPage },
      { path: 'home', loadChildren: () => import('app/modules/landing/home/home.module').then((m) => m.LandingHomeModule) },
      { path: 'market', loadChildren: () => import('app/modules/landing/collections/collections.module').then((m) => m.CollectionsModule) },
      { path: 'market/sale/:id', loadChildren: () => import('app/modules/landing/collection-details/collection-details.module').then((m) => m.CollectionDetailsModule) },
      { path: 'cart', loadChildren: () => import('app/modules/landing/cart/cart.module').then((m) => m.CartModule) },
      { path: 'order-success', loadChildren: () => import('app/modules/landing/order-success/order-success.module').then((m) => m.OrderSuccessModule) },
      { path: 'category/:category', loadChildren: () => import('app/modules/landing/category/category.module').then((m) => m.CategoryModule) },
      { path: 'nft/:contractAddress/:tokenId', loadChildren: () => import('app/modules/landing/nft-details/nft-details.module').then((m) => m.NftDetailsModule) },
      {
        path: 'drops',
        component: DropsComponent,
        children: [
          { path: '', component: LandingDropComponent },
          { path: 'create', canActivate: [AuthGuard, WalletGuard], data: { roles: [Role.Admin, Role.SuperUser] }, component: SingleDropComponent },
          { path: ':id', component: SingleDropComponent }
        ]
      }
    ]
  },

  /* Helper routes
   * After user signs in, they are redirected to this route, which then redirects them to the desired location.
   * Path is here for convenience and collocation/centralization of all routes in this module.
   */
  { path: 'signed-in-redirect', pathMatch: 'full', redirectTo: 'market' },
  { path: 'default', pathMatch: 'full', redirectTo: defaultMCLRedirectLandingPage },
  { path: 'connect-wallet', pathMatch: 'full', redirectTo: 'profile/wallet' },
  { path: 'chain-id-change', pathMatch: 'full', redirectTo: 'home' },

  /* GUEST routes
   * Routes that are only for unathenticated users; these are primarily to help users sign-in, sign-up, etc..
   * these routes should not be accessible for users that are already signed in.
   */
  {
    path: '',
    canActivate: [NoAuthGuard],
    canActivateChild: [NoAuthGuard],
    component: LayoutComponent,
    data: {
      entry: 'guests, no-auth-guard',
      layout: 'empty'
    },
    children: [
      {
        path: 'confirmation-required',
        loadChildren: () => import('app/modules/auth/confirmation-required/confirmation-required.module').then((m) => m.AuthConfirmationRequiredModule)
      },
      {
        path: 'forgot-password',
        loadChildren: () => import('app/modules/auth/forgot-password/forgot-password.module').then((m) => m.AuthForgotPasswordModule)
      },
      {
        path: 'reset-password',
        loadChildren: () => import('app/modules/auth/reset-password/reset-password.module').then((m) => m.AuthResetPasswordModule)
      },
      {
        path: 'sign-in',
        loadChildren: () => import('app/modules/auth/sign-in/sign-in.module').then((m) => m.AuthSignInModule)
      },
      {
        path: 'sign-up',
        loadChildren: () => import('app/modules/auth/sign-up/sign-up.module').then((m) => m.AuthSignUpModule)
      },
      {
        path: 'sign-up-mcl',
        loadChildren: () => import('app/modules/auth/sign-up-mcl/sign-up-mcl.module').then((m) => m.SignUpMCLModule)
      }
    ]
  },

  /****
   * Achievement routes
   */
  {
    path: 'achievement',
    canActivate: [],
    canActivateChild: [],
    component: LandingLayoutComponent,
    children: [{ path: '', loadChildren: () => import('app/modules/achievement/achievement.module').then((m) => m.AchievementModule) }]
  },

  /* AUTHENTICATED routes
   * Routes that require a user to be authenticated. These routes should not be accessible for guests (unauthenticated users).
   */
  {
    path: '',
    canActivate: [AuthGuard],
    canActivateChild: [AuthGuard],
    component: LayoutComponent,
    data: {
      layout: 'empty',
      roles: [Role.User, Role.Admin, Role.SuperUser]
    },
    children: [
      { path: 'sign-out', loadChildren: () => import('app/modules/auth/sign-out/sign-out.module').then((m) => m.AuthSignOutModule) },
      { path: 'unlock-session', loadChildren: () => import('app/modules/auth/unlock-session/unlock-session.module').then((m) => m.AuthUnlockSessionModule) }
    ]
  },

  /* ADMNINISTRATOR routes
   * Routes purely for administrators only. These are for authenticated users that have special roles. Standard users
   * of the system should not have access to these routes.
   * TODO: Restrict these routes based on roles.
   */
  {
    path: '',
    canActivate: [WalletGuard, AuthGuard],
    canActivateChild: [WalletGuard, AuthGuard],
    component: LayoutComponent,
    resolve: {
      initialData: InitialDataResolver
    },
    data: {
      layout: 'classy' // Keep set to classy or we lose our UI.
      //roles: [Role.Admin, Role.SuperUser]
    },
    children: [
      { path: 'dashboard', loadChildren: () => import('app/modules/admin/dashboard/dashboard.module').then((m) => m.DashboardModule) },
      { path: 'create-product', loadChildren: () => import('app/modules/admin/product/create-product/create-product.module').then((m) => m.CreateProductModule) },
      { path: 'list-product', loadChildren: () => import('app/modules/admin/product/list-product/list-product.module').then((m) => m.ListProductModule) },
      { path: 'edit-product/:id', loadChildren: () => import('app/modules/admin/product/edit-product/edit-product.module').then((m) => m.EditProductModule) },
      { path: 'blockchain/deploy', loadChildren: () => import('app/modules/admin/blockchain/deploy/deploy.module').then((m) => m.DeployModule) },
      {
        path: 'admin-purchase-history',
        loadChildren: () => import('app/modules/admin/admin-purchase-history/admin-purchase-history.module').then((m) => m.AdminPurchaseHistoryModule)
      }
    ]
  },

  {
    path: '',
    canActivate: [AuthGuard],
    canActivateChild: [AuthGuard],
    component: LayoutComponent,
    resolve: {
      initialData: InitialDataResolver
    },
    data: {
      layout: 'classy', // Keep set to classy or we lose our UI.
      roles: [Role.Admin, Role.SuperUser]
    },
    children: [
      { path: 'create-admin', loadChildren: () => import('app/modules/admin/create-admin/create-admin-module').then((m) => m.CreateAdminModule) },
      { path: 'list-admins', loadChildren: () => import('app/modules/admin/list-admins/list-admin-module').then((m) => m.ListAdminModule) },
      { path: 'pending-payouts', loadChildren: () => import('app/modules/admin/pending-payouts/pending-payouts-module').then((m) => m.PendingPayoutsModule) }
    ]
  },

  /* Profile routes
   * Routes for profile features that require a user to be authenticated.
   * These routes should not be accessible for guests (unauthenticated users).
   */
  {
    path: 'profile',
    canActivate: [],
    canActivateChild: [],
    component: LandingLayoutComponent,
    children: [{ path: '', loadChildren: () => import('app/modules/admin/profile/profile.module').then((m) => m.ProfileModule) }]
  },

  // otherwise, redirect to default
  { path: '**', redirectTo: defaultMCLRedirectLandingPage }
];
