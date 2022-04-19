import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { MatTabsModule } from '@angular/material/tabs';
import { SharedModule } from 'app/shared/shared.module';
import { ConfirmationComponent } from './confirmation.component';
import { confirmationRoutes } from './confirmation.routing';

@NgModule({
  declarations: [ConfirmationComponent],
  imports: [CommonModule, RouterModule.forChild(confirmationRoutes), MatTabsModule, SharedModule]
})
export class ConfirmationModule {}
