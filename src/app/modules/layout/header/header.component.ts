import { Component, NgZone, OnInit } from '@angular/core';
import { AuthService } from 'app/core/auth/auth.service';
import { User } from '../../../core/user/user.types';
import { CartService } from 'app/core/cart/cart.service';
import { VenlyService } from 'app/core/venly/venly.service';
import { WalletService } from '../../../core/wallet/wallet.service';
import { CartItem } from 'app/core/cart/cartItem';
import { Role } from '../../../core/models/role';
@Component({
  selector: 'app-header',
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.scss']
})
export class HeaderComponent implements OnInit {
  nav: any = [
    { url: 'home', title: 'Home' },
    { url: 'market', title: 'Market' },
    { url: 'drops', title: 'Drops' }
  ];

  loggedIn: boolean;
  walletAddress: string;
  notInstalled: boolean;
  isAdmin: boolean;
  isNotificationClicked: boolean = false;
  notificationList: any[] = [];
  newNotificationList: any[] = [];
  archiveList: any[] = [];
  isGettingArchive: boolean = false;

  constructor(private authService: AuthService, private cartService: CartService, public walletService: WalletService, private ngZone: NgZone) {}

  ngOnInit(): void {
    this.authService.check().subscribe((authenticated) => {
      this.loggedIn = authenticated;
    });

    this.isAdmin = this.authService.isAdmin();

    this.walletService.getAccounts().subscribe((accounts) => {
      this.ngZone.run(() => {
        if (accounts.length === 0) {
          this.walletAddress = null;
        } else {
          this.walletAddress = accounts[0];
        }
      });
    });

    // get all notification that is not yet mark as read
    this.getNotification();
  }

  isLoggedIn(): boolean {
    return this.loggedIn;
  }
  isAdminRole(): boolean {
    return this.isAdmin;
  }

  isAdminOrSuperUser(): boolean {
    if (this.isAdmin) {
      return true;
    } else if (this.authService.user.role === Role.SuperUser) {
      return true;
    } else {
      return false;
    }
  }

  getUser(): User {
    return this.authService.user;
  }

  getProducts(): Array<CartItem> {
    return this.cartService.getCartItems();
  }

  getProductsCount(): number {
    return this.cartService.getItemsCount();
  }

  // WIP function

  openNotification() {
    this.isNotificationClicked = !this.isNotificationClicked;
  }

  getNotification() {
    // Sample data for demonstration only, can be removed
    const notifData = [
      {
        title: 'Card Sold',
        message: 'Card#5232 has been bought',
        status: 'new',
        type: 'info'
      },
      {
        title: 'Card Deleted',
        message: 'Card#5232 has been deleted',
        status: 'new',
        type: 'warning'
      }
    ];

    this.notificationList = this.newNotificationList = [];
  }

  getUnreadNotification() {
    this.isGettingArchive = false;
    this.notificationList = this.newNotificationList;
  }

  getArchiveNotification() {
    // get all un-read notification
    this.isGettingArchive = true;
    this.notificationList = this.archiveList;
  }

  removeCard(index: number) {
    // Remove locally
    this.notificationList[index].status = 'archive';
    this.archiveList.push(this.notificationList[index]);
    this.newNotificationList.splice(index, 1);
    this.notificationList = this.newNotificationList;
    // TODO: Call the endpoint that the notification has been mark as read
  }
}
