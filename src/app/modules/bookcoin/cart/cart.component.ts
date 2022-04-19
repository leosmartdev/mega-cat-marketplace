/* eslint-disable max-len */
import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { AuthService } from 'app/core/auth/auth.service';
import { CartService } from 'app/core/cart/cart.service';
import { BsModalService, BsModalRef } from 'ngx-bootstrap/modal';
import { SharedService } from 'app/core/shared/shared.service';
@Component({
  selector: 'app-cart',
  templateUrl: './cart.component.html',
  styleUrls: ['./cart.component.scss']
})
export class CartComponent implements OnInit {
  products = [];
  loggedIn: boolean;
  public modalRef: BsModalRef;
  constructor(
    private _cartService: CartService,
    private _activatedRoute: ActivatedRoute,
    private _router: Router,
    private _authService: AuthService,
    private modalService: BsModalService,
    private sharedService: SharedService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.sharedService.url.next(this.router.url);
    this._authService.check().subscribe((authenticated) => {
      this.loggedIn = authenticated;
    });
    this.products = this._cartService.getCartItems();
  }

  removeProductFromCart(id: string): void {
    this._cartService.removeCartItem(id);
    this.products = this._cartService.getCartItems();
  }

  getProductsSum(): number {
    return this._cartService.getItemsSum();
  }

  checkOut(): void {
    if (this.loggedIn) {
      if (this._cartService.getItemsCount() !== 0) {
        this._router.navigateByUrl('/checkout/USD');
      }
    } else {
      const redirectURL = this._activatedRoute.snapshot.queryParamMap.get('redirectURL') || '/sign-in';
      // Navigate to the redirect url
      this._router.navigateByUrl(redirectURL);
    }
  }

  checkOutEth(): void {
    if (this.loggedIn) {
      if (this._cartService.getItemsCount() !== 0) {
        const param = 'ETH';
        this._router.navigateByUrl(`/order-completed/${param}`);
      }
    } else {
      const redirectURL = this._activatedRoute.snapshot.queryParamMap.get('redirectURL') || '/sign-in';
      // Navigate to the redirect url
      this._router.navigateByUrl(redirectURL);
    }
  }
}
