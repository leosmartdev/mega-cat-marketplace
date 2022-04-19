import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CartComponent } from 'app/modules/landing/cart/cart.component';
import { RouterModule } from '@angular/router';
import { landingCartRoutes } from './cart.routing';
import { SharedModule } from 'app/shared/shared.module';
import { HttpClientModule } from '@angular/common/http';
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { MatIconModule } from '@angular/material/icon';

@NgModule({
  declarations: [CartComponent],
  imports: [CommonModule, RouterModule.forChild(landingCartRoutes), SharedModule, HttpClientModule, NgbModule, MatIconModule]
})
export class CartModule {}
