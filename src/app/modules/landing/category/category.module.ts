import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CategoryComponent } from './category.component';
import { RouterModule } from '@angular/router';
import { MatTabsModule } from '@angular/material/tabs';
import { SharedModule } from 'app/shared/shared.module';
import { categoryRoutes } from './category.routing';
import { ModalModule } from 'ngx-bootstrap/modal';
import { NftCardModule } from 'app/modules/elements/nft-card/nft-card.module';

@NgModule({
  declarations: [CategoryComponent],
  imports: [CommonModule, RouterModule.forChild(categoryRoutes), MatTabsModule, SharedModule, ModalModule, NftCardModule]
})
export class CategoryModule {}
