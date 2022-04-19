import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { SharedModule } from 'app/shared/shared.module';
import { auctionDetailRoutes } from './auction-detail.routing';
import { AuctionDetailComponent } from './auction-detail.component';
import { NftCardBkcnModule } from 'app/modules/elements/nft-card-bkcn/nft-card-bkcn.module';
import { CountdownModule } from 'ngx-countdown';
import { MatTableModule } from '@angular/material/table';
import { NgxPaginationModule } from 'ngx-pagination';

@NgModule({
  declarations: [AuctionDetailComponent],
  imports: [CommonModule, MatTableModule, NgxPaginationModule, RouterModule.forChild(auctionDetailRoutes), SharedModule, NftCardBkcnModule, CountdownModule]
})
export class AuctionDetailModule {}
