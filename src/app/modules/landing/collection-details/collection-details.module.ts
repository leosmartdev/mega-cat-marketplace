import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { MatTabsModule } from '@angular/material/tabs';
import { SharedModule } from 'app/shared/shared.module';
import { CollectionDetailsComponent } from './collection-details.component';
import { collectionDetailsRoutes } from './collection-details.routing';
import { ModalModule } from 'ngx-bootstrap/modal';

@NgModule({
  declarations: [CollectionDetailsComponent],
  imports: [CommonModule, RouterModule.forChild(collectionDetailsRoutes), MatTabsModule, SharedModule, ModalModule]
})
export class CollectionDetailsModule {}
