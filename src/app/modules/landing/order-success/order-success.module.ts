import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { OrderSuccessComponent } from 'app/modules/landing/order-success/order-success.component';
import { RouterModule } from '@angular/router';
import { orderSuccessRoutes } from './order-success.routing';
import { SharedModule } from 'app/shared/shared.module';
import { HttpClientModule } from '@angular/common/http';

@NgModule({
  declarations: [OrderSuccessComponent],
  imports: [CommonModule, RouterModule.forChild(orderSuccessRoutes), SharedModule, HttpClientModule]
})
export class OrderSuccessModule {}
