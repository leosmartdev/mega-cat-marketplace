import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { CollectionsComponent } from 'app/modules/bookcoin/collections/collections.component';
import { collectionsRoutes } from 'app/modules/bookcoin/collections/collections.routing';
import { MatTabsModule } from '@angular/material/tabs';
import { MatSelectModule } from '@angular/material/select';
import { SharedModule } from 'app/shared/shared.module';
import { NftCardBkcnModule } from 'app/modules/elements/nft-card-bkcn/nft-card-bkcn.module';

@NgModule({
  declarations: [CollectionsComponent],
  imports: [CommonModule, MatTabsModule, MatSelectModule, RouterModule.forChild(collectionsRoutes), SharedModule, NftCardBkcnModule]
})
export class CollectionsModule {}
