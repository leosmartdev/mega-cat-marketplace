import { NgModule } from '@angular/core';
import { HttpClientModule } from '@angular/common/http';
import { CartService } from 'app/core/cart/cart.service';

@NgModule({
  imports: [HttpClientModule],
  providers: [CartService]
})
export class CartModule {}
