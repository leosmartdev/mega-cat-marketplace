import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { MatTabsModule } from '@angular/material/tabs';
import { SharedModule } from 'app/shared/shared.module';
import { CheckoutComponent } from './checkout.component';
import { checkoutRoutes } from './checkout.routing';
import { MatButtonModule } from '@angular/material/button';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSelectModule } from '@angular/material/select';

@NgModule({
  declarations: [CheckoutComponent],
  imports: [
    CommonModule,
    RouterModule.forChild(checkoutRoutes),
    MatTabsModule,
    MatButtonModule,
    MatCheckboxModule,
    MatFormFieldModule,
    MatIconModule,
    MatInputModule,
    MatSelectModule,
    MatProgressSpinnerModule,
    SharedModule
  ]
})
export class CheckoutModule {}
