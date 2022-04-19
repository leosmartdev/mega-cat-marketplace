import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { CollectionComponent } from 'app/modules/bookcoin/collection/collection.component';
import { collectionRoutes } from 'app/modules/bookcoin/collection/collection.routing';
import { MatTabsModule } from '@angular/material/tabs';
import { MatSelectModule } from '@angular/material/select';
import { SharedModule } from 'app/shared/shared.module';
import { HomepageModule } from 'app/core/homepage/homepage.module';
import { IvyCarouselModule } from 'angular-responsive-carousel';
import { NftCardBkcnModule } from 'app/modules/elements/nft-card-bkcn/nft-card-bkcn.module';

@NgModule({
  declarations: [CollectionComponent],
  imports: [CommonModule, MatTabsModule, MatSelectModule, RouterModule.forChild(collectionRoutes), SharedModule, HomepageModule, IvyCarouselModule, NftCardBkcnModule]
})
export class CollectionModule {}
