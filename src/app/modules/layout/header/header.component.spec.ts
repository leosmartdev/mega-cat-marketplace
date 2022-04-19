import { ComponentFixture, TestBed } from '@angular/core/testing';

import { HeaderComponent } from './header.component';
import { AuthService } from '../../../core/auth/auth.service';
import { CartService } from 'app/core/cart/cart.service';
import { HttpClient, HttpHandler } from '@angular/common/http';
import { from, of } from 'rxjs';
import { WalletService } from '../../../core/wallet/wallet.service';
import { mockUser } from 'app/core/auction/spec-files/mocked';
import { Role } from 'app/core/models/role';
import { mockedCartItem } from 'app/modules/landing/cart/spec-files/mocked';

describe('HeaderComponent', () => {
  let component: HeaderComponent;
  let fixture: ComponentFixture<HeaderComponent>;

  const mockedEthereum = {
    on: jasmine.createSpy('on', (event, callback) => {
      if (event === 'accountsChanged') {
        callback(['0xd954F4513BdE1E00F3986630A7e73c4f9aA564fE']);
      }
    })
  };
  const walletServiceMock = jasmine.createSpyObj('WalletService', ['getAccounts', 'isMetaMaskInstalled']);
  walletServiceMock.getAccounts.and.returnValue(of([]));
  walletServiceMock.isMetaMaskInstalled.and.returnValue(true);

  const authServiceMock = jasmine.createSpyObj('AuthService', ['check', 'isAdmin', 'user']);
  authServiceMock.check.and.returnValue(of(false));
  authServiceMock.isAdmin.and.returnValue(of(false));
  authServiceMock.user = mockUser;

  const cartServiceMock = jasmine.createSpyObj('CartService', ['getCartItems', 'getItemsCount']);

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [HeaderComponent],
      providers: [
        { provide: HttpHandler },
        { provide: HttpClient },
        { provide: WalletService, useValue: walletServiceMock },
        { provide: AuthService, useValue: authServiceMock },
        { provide: CartService, useValue: cartServiceMock }
      ]
    }).compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(HeaderComponent);

    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    walletServiceMock.getAccounts.and.returnValue(of([]));
    expect(component).toBeTruthy();
  });

  it('should create with wallet address', () => {
    walletServiceMock.getAccounts.and.returnValue(of(['test address']));
    expect(component).toBeTruthy();
  });

  it('should get user successfully', () => {
    const response = component.getUser();

    expect(response).toEqual(mockUser);
  });

  describe('isLoggedIn', () => {
    it('should return true', () => {
      component.loggedIn = true;

      expect(component.isLoggedIn()).toBe(true);
    });

    it('should return false', () => {
      component.loggedIn = false;

      expect(component.isLoggedIn()).toBe(false);
    });
  });

  describe('isAdminRole', () => {
    it('should return true', () => {
      component.isAdmin = true;

      expect(component.isAdminRole()).toBe(true);
    });

    it('should return false', () => {
      component.isAdmin = false;

      expect(component.isAdminRole()).toBe(false);
    });
  });

  describe('isAdminOrSpuerUser', () => {
    it('should return true for admin', () => {
      component.isAdmin = true;

      expect(component.isAdminOrSuperUser()).toBe(true);
    });

    it('should return true for Super user', () => {
      component.isAdmin = false;
      mockUser.role = Role.SuperUser;

      expect(component.isAdminOrSuperUser()).toBe(true);
    });

    it('should return false for common user', () => {
      component.isAdmin = false;
      mockUser.role = Role.User;

      expect(component.isAdminOrSuperUser()).toBe(false);
    });
  });

  it('should get products from cart', () => {
    cartServiceMock.getCartItems.and.returnValue([mockedCartItem]);

    const response = component.getProducts();

    expect(response).toEqual([mockedCartItem]);
  });

  it('should get the count of products present in cart', () => {
    cartServiceMock.getItemsCount.and.returnValue(5);

    const response = component.getProductsCount();

    expect(response).toEqual(5);
  });

  it('should open notification', () => {
    component.openNotification();

    expect(component.isNotificationClicked).toBe(true);
  });

  it('should get unread notifications', () => {
    component.getUnreadNotification();

    expect(component.isGettingArchive).toBe(false);
    expect(component.notificationList).toEqual(component.newNotificationList);
  });

  it('should get archived notifications', () => {
    component.getArchiveNotification();

    expect(component.isGettingArchive).toBe(true);
    expect(component.notificationList).toEqual(component.archiveList);
  });

  it('should remove card', () => {
    component.notificationList = [{ status: 'unread' }];
    component.newNotificationList = [{ status: 'unread' }];

    component.removeCard(0);

    expect(component.newNotificationList).toEqual([]);
    expect(component.notificationList).toEqual(component.newNotificationList);
    expect(component.archiveList).toEqual([{ status: 'archive' }]);
  });
});
