import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { LandingCollectionsComponent } from 'app/modules/landing/collections/collections.component';
import { landingCollectionsRoutes } from 'app/modules/landing/collections/collections.routing';
import { MatTabsModule } from '@angular/material/tabs';
import { SharedModule } from 'app/shared/shared.module';
import { NftCardModule } from 'app/modules/elements/nft-card/nft-card.module';

@NgModule({
  declarations: [LandingCollectionsComponent],
  imports: [CommonModule, RouterModule.forChild(landingCollectionsRoutes), MatTabsModule, SharedModule, NftCardModule]
})
export class CollectionsModule {}
