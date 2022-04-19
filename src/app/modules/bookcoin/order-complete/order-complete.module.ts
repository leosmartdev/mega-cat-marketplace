import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { OrderCompleteComponent } from 'app/modules/bookcoin/order-complete/order-complete.component';
import { RouterModule } from '@angular/router';
import { landingOrderCompleteRoutes } from './order-complete.routing';
import { SharedModule } from 'app/shared/shared.module';
import { HttpClientModule } from '@angular/common/http';
import { DatePipe } from '@angular/common';

@NgModule({
  declarations: [OrderCompleteComponent],
  imports: [CommonModule, RouterModule.forChild(landingOrderCompleteRoutes), SharedModule, HttpClientModule],
  providers: [DatePipe]
})
export class OrderCompleteModule {}
