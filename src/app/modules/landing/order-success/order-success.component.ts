import { Component, OnDestroy, OnInit } from '@angular/core';
import { CartService } from 'app/core/cart/cart.service';
import { OfferResponseModel } from 'app/core/models/offer-response.model';
@Component({
  selector: 'app-order-success',
  templateUrl: './order-success.component.html',
  styleUrls: ['./order-success.component.scss']
})
export class OrderSuccessComponent implements OnInit, OnDestroy {
  products = [];
  itemStatuses: OfferResponseModel[];
  constructor(private cartService: CartService) {}

  ngOnInit(): void {
    this.products = this.cartService.getCartItems();
    this.itemStatuses = this.cartService.getCompletedOrder();
    this.cartService.cartItems = [];
  }

  ngOnDestroy(): void {
    localStorage.removeItem('cart');
    this.cartService.orderItemStatuses = [];
  }
}
