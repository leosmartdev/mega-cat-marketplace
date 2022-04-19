import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { MatTabsModule } from '@angular/material/tabs';
import { SharedModule } from 'app/shared/shared.module';
import { collectionDetailRoutes } from './collection-detail.routing';
import { CollectionDetailComponent } from './collection-detail.component';

@NgModule({
  declarations: [CollectionDetailComponent],
  imports: [CommonModule, RouterModule.forChild(collectionDetailRoutes), MatTabsModule, SharedModule]
})
export class CollectionDetailModule {}
