import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CartComponent } from 'app/modules/bookcoin/cart/cart.component';
import { RouterModule } from '@angular/router';
import { landingCartRoutes } from './cart.routing';
import { SharedModule } from 'app/shared/shared.module';
import { HttpClientModule } from '@angular/common/http';
import { MatTabsModule } from '@angular/material/tabs';

@NgModule({
  declarations: [CartComponent],
  imports: [CommonModule, RouterModule.forChild(landingCartRoutes), SharedModule, MatTabsModule, HttpClientModule]
})
export class CartModule {}
