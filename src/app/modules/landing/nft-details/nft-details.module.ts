import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { NftDetailsComponent } from './nft-details.component';
import { nftDetailsRoutes } from './nft-details.routing';
import { SharedModule } from 'app/shared/shared.module';
import { NftCardModule } from 'app/modules/elements/nft-card/nft-card.module';
import { BiddingDetailsComponent } from './bidding-details/bidding-details.component';
import { CountdownModule } from 'ngx-countdown';

@NgModule({
  declarations: [NftDetailsComponent, BiddingDetailsComponent],
  imports: [CommonModule, RouterModule.forChild(nftDetailsRoutes), SharedModule, NftCardModule, CountdownModule]
})
export class NftDetailsModule {}
