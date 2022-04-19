import { ComponentFixture, TestBed } from '@angular/core/testing';

import { HeaderComponent } from './header.component';
import { AuthService } from 'app/core/auth/auth.service';
import { CartService } from 'app/core/cart/cart.service';
import { HttpClient, HttpHandler } from '@angular/common/http';
import { from, of } from 'rxjs';
import { WalletService } from 'app/core/wallet/wallet.service';
import { SharedService } from 'app/core/shared/shared.service';
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

  const authServiceMock = jasmine.createSpyObj('AuthService', ['check', 'user', 'updateWalletAddresses']);
  authServiceMock.check.and.returnValue(of(false));
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
        { provide: SharedService },
        { provide: CartService, useValue: cartServiceMock }
      ]
    }).compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(HeaderComponent);

    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  afterEach(() => {
    fixture.destroy();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should create with wallet address', () => {
    walletServiceMock.getAccounts.and.returnValue(of(['test Address']));
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

  describe('isAdminOrSpuerUser', () => {
    it('should return true for admin', () => {
      mockUser.role = Role.Admin;

      expect(component.isAdminOrSuperUser()).toBe(true);
    });

    it('should return true for Super user', () => {
      mockUser.role = Role.SuperUser;

      expect(component.isAdminOrSuperUser()).toBe(true);
    });

    it('should return false for common user', () => {
      mockUser.role = Role.User;

      expect(component.isAdminOrSuperUser()).toBe(false);
    });
  });

  it('should respond with an array of cart items', () => {
    cartServiceMock.getCartItems.and.returnValue([mockedCartItem]);

    const response = component.getProducts();

    expect(response).toEqual([mockedCartItem]);
  });

  it('should respond with no of items present in cart', () => {
    cartServiceMock.getItemsCount.and.returnValue(1);

    const response = component.getProductsCount();

    expect(response).toEqual(1);
  });
});
