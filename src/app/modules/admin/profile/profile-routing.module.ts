import { NgModule } from '@angular/core';
import { Route, RouterModule } from '@angular/router';
import { AuthGuard } from 'app/core/auth/guards/auth.guard';
import { WalletGuard } from 'app/core/auth/guards/wallet.guard';
import { Role } from 'app/core/models/role';
import { CreateCollectionComponent } from './create-collection/create-collection.component';
import { CreateComponent } from './create/create.component';
import { EditListingComponent } from './edit-listing/edit-listing.component';
import { LandingComponent } from './landing/landing.component';
import { PayoutsStatusComponent } from './payouts-status/payouts-status.component';
import { ProfileComponent } from './profile.component';
import { SettingsComponent } from './settings/settings.component';
import { WalletComponent } from './wallet/wallet.component';
import { PurchaseHistoryComponent } from './purchase-history/purchase-history.component';
import { SalesHistoryComponent } from './sales-history/sales-history.component';

const profileRoutes: Route[] = [
  {
    path: '',
    canActivateChild: [AuthGuard],
    component: ProfileComponent,
    children: [
      { path: '', component: LandingComponent },
      {
        path: 'wallet',
        component: WalletComponent
      },
      {
        path: 'user-auctions',
        component: LandingComponent,
        data: {
          isUserAuction: true
        }
      },
      {
        path: 'participated-auctions',
        component: LandingComponent,
        data: {
          isParticipatedAuction: true
        }
      },
      {
        path: 'settings',
        canActivate: [WalletGuard],
        component: SettingsComponent
      },
      {
        path: 'create',
        data: {
          roles: [Role.Admin, Role.SuperUser]
        },
        canActivate: [AuthGuard, WalletGuard],
        component: CreateComponent
      },
      {
        path: 'create-collection',
        data: {
          roles: [Role.Admin, Role.SuperUser]
        },
        canActivate: [AuthGuard, WalletGuard],
        component: CreateCollectionComponent
      },
      {
        path: 'edit-listing',
        canActivate: [AuthGuard, WalletGuard],
        component: EditListingComponent
      },
      {
        path: 'purchase-history',
        canActivate: [AuthGuard, WalletGuard],
        component: PurchaseHistoryComponent
      },
      {
        path: 'sales-history',
        canActivate: [AuthGuard, WalletGuard],
        component: SalesHistoryComponent
      },
      {
        path: 'payouts',
        data: {
          roles: [Role.Admin, Role.SuperUser]
        },
        canActivate: [AuthGuard, WalletGuard],
        component: PayoutsStatusComponent
      }
    ]
  }
];

@NgModule({
  imports: [RouterModule.forChild(profileRoutes)],
  exports: [RouterModule]
})
export class ProfileRoutingModule {}
