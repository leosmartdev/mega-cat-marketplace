import { NgModule } from '@angular/core';
import { Route, RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';
import { SharedModule } from 'app/shared/shared.module';
import { HttpClientModule } from '@angular/common/http';
import { NftCardModule } from 'app/modules/elements/nft-card/nft-card.module';

import { MatButtonModule } from '@angular/material/button';
import { MatButtonToggleModule } from '@angular/material/button-toggle';
import { MatChipsModule } from '@angular/material/chips';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatDividerModule } from '@angular/material/divider';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatMenuModule } from '@angular/material/menu';
import { MatMomentDateModule } from '@angular/material-moment-adapter';
import { MatSelectModule } from '@angular/material/select';
import { FuseHighlightModule } from '@fuse/components/highlight';
import { MatListModule } from '@angular/material/list';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MarkdownModule } from 'ngx-markdown';

import { ProfileComponent } from 'app/modules/bookcoin/profile/profile.component';
import { SettingsComponent } from './settings/settings.component';
import { CreateComponent } from './create/create.component';
import { CreateCollectionComponent } from './create-collection/create-collection.component';
import { NftDetailComponent } from './nft-detail/nft-detail.component';
import { PurchaseHistoryComponent } from './purchase-history/purchase-history.component';
import { SalesHistoryComponent } from './sales-history/sales-history.component';

import { WalletGuard } from 'app/core/auth/guards/wallet.guard';

import { AuthGuard } from 'app/core/auth/guards/auth.guard';
import { WalletComponent } from './wallet/wallet.component';
import { Role } from 'app/core/models/role';
import { IvyCarouselModule } from 'angular-responsive-carousel';
import { PayoutsStatusComponent } from './payouts-status/payouts-status.component';
import { MatTableModule } from '@angular/material/table';
import { NgxPaginationModule } from 'ngx-pagination';
import { NgxFilesizeModule } from 'ngx-filesize';
import { EditListingComponent } from './edit-listing/edit-listing.component';
import { EditListingCardModule } from 'app/modules/elements/edit-listing-card/edit-listing-card.module';
import { MyAuctionsComponent } from './my-auctions/my-auctions.component';
import { ParticipatedAuctionsComponent } from './participated-auctions/participated-auctions.component';
import { NftCardBkcnModule } from 'app/modules/elements/nft-card-bkcn/nft-card-bkcn.module';
import { ProfileNavlinksComponent } from 'app/modules/elements/profile-navlinks/profile-navlinks.component';
import { ColorPickerModule } from 'ngx-color-picker';
import { CreateRewardComponent } from './create-reward/create-reward.component';
import { ListRewardsComponent } from './list-rewards/list-rewards.component';
import { ListCollectionsComponent } from './list-collections/list-collections.component';
import { EditCollectionComponent } from './edit-collection/edit-collection.component';
import { MatTreeModule } from '@angular/material/tree';
import { RewardsExplorerComponent } from './rewards-explorer/rewards-explorer.component';
import { MatPaginatorModule } from '@angular/material/paginator';

const routes: Route[] = [
  {
    path: '',
    canActivate: [AuthGuard, WalletGuard],
    component: ProfileComponent
  },
  {
    path: 'wallet',
    component: WalletComponent
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
    path: 'create-reward',
    data: {
      roles: [Role.Admin, Role.SuperUser]
    },
    canActivate: [AuthGuard, WalletGuard],
    component: CreateRewardComponent
  },
  {
    path: 'payouts-status',
    canActivate: [AuthGuard, WalletGuard],
    component: PayoutsStatusComponent
  },
  {
    path: 'edit-listing',
    canActivate: [AuthGuard, WalletGuard],
    component: EditListingComponent
  },
  {
    path: 'my-auctions',
    canActivate: [AuthGuard, WalletGuard],
    component: MyAuctionsComponent
  },
  {
    path: 'participated-auctions',
    canActivate: [AuthGuard, WalletGuard],
    component: ParticipatedAuctionsComponent
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
    path: 'list-collections',
    data: {
      roles: [Role.Admin, Role.SuperUser]
    },
    canActivate: [AuthGuard, WalletGuard],
    component: ListCollectionsComponent
  },
  {
    path: 'edit-collection/:smartContractAddress/:chain',
    data: {
      roles: [Role.Admin, Role.SuperUser]
    },
    canActivate: [AuthGuard, WalletGuard],
    component: EditCollectionComponent
  },
  {
    path: 'nft-detail/:contractAddress/:tokenId',
    canActivate: [AuthGuard, WalletGuard],
    component: NftDetailComponent
  },
  {
    path: 'list-rewards',
    data: {
      roles: [Role.Admin, Role.SuperUser]
    },
    canActivate: [AuthGuard, WalletGuard],
    component: ListRewardsComponent
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
  }
];

@NgModule({
  declarations: [
    ProfileComponent,
    SettingsComponent,
    CreateComponent,
    WalletComponent,
    CreateCollectionComponent,
    PayoutsStatusComponent,
    EditListingComponent,
    MyAuctionsComponent,
    ParticipatedAuctionsComponent,
    ProfileNavlinksComponent,
    NftDetailComponent,
    CreateRewardComponent,
    ListRewardsComponent,
    ListCollectionsComponent,
    EditCollectionComponent,
    RewardsExplorerComponent,
    PurchaseHistoryComponent,
    SalesHistoryComponent
  ],
  imports: [
    NftCardBkcnModule,
    SharedModule,
    CommonModule,
    EditListingCardModule,
    HttpClientModule,
    NftCardModule,
    MatButtonModule,
    MatButtonToggleModule,
    MatChipsModule,
    MatDatepickerModule,
    MatDividerModule,
    MatFormFieldModule,
    MatInputModule,
    MatMenuModule,
    MatMomentDateModule,
    MatSelectModule,
    MatTableModule,
    MatTreeModule,
    MatIconModule,
    NgxPaginationModule,
    NgxFilesizeModule,
    FuseHighlightModule,
    MatListModule,
    MatProgressSpinnerModule,
    RouterModule.forChild(routes),
    IvyCarouselModule,
    ColorPickerModule,
    MatPaginatorModule,
    MarkdownModule.forRoot({})
  ]
})
export class ProfileModule {}
