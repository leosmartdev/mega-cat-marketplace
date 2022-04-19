import { Component, NgZone, OnInit } from '@angular/core';
import { AuthService } from 'app/core/auth/auth.service';
import { User } from 'app/core/user/user.types';
import { CartService } from 'app/core/cart/cart.service';
import { WalletService } from 'app/core/wallet/wallet.service';
import { CartItem } from 'app/core/cart/cartItem';
import { SharedService } from 'app/core/shared/shared.service';
import { Role } from '../../../../core/models/role';

@Component({
  selector: 'app-header',
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.scss']
})
export class HeaderComponent implements OnInit {
  nav: any = [
    { url: 'bookcoin/home', title: 'Home' },
    { url: 'bookcoin/market', title: 'Market' },
    { url: 'trading', title: 'Trading' },
    { url: 'bookcoin/profile', title: 'Profile' }
  ];

  loggedIn: boolean;
  walletAddress: string;
  notInstalled: boolean;
  public url: string = '';
  public isCollapsed: boolean = true;

  constructor(
    private authService: AuthService,
    private cartService: CartService,
    public walletService: WalletService,
    private sharedService: SharedService,
    private ngZone: NgZone
  ) {
    this.sharedService.url.subscribe((value) => (this.url = value));
  }

  ngOnInit(): void {
    this.authService.check().subscribe((authenticated) => {
      this.loggedIn = authenticated;
    });

    this.walletService.getAccounts().subscribe((accounts) => {
      this.ngZone.run(() => {
        if (accounts.length === 0) {
          this.walletAddress = null;
        } else {
          this.walletAddress = accounts[0];
        }
      });
    });
  }

  isLoggedIn(): boolean {
    return this.loggedIn;
  }

  getUser(): User {
    return this.authService.user;
  }

  isAdminOrSuperUser(): boolean {
    if (this.authService.user.role === Role.Admin) {
      return true;
    } else if (this.authService.user.role === Role.SuperUser) {
      return true;
    } else {
      return false;
    }
  }

  getProducts(): Array<CartItem> {
    return this.cartService.getCartItems();
  }

  getProductsCount(): number {
    return this.cartService.getItemsCount();
  }
}
