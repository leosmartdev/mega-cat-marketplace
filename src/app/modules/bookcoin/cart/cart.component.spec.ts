import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CartComponent } from './cart.component';
import { CartService } from 'app/core/cart/cart.service';
import { ActivatedRoute, Router } from '@angular/router';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { HttpClient } from '@angular/common/http';
import { AuthService } from 'app/core/auth/auth.service';
import { BsModalService } from 'ngx-bootstrap/modal';
import { of } from 'rxjs';
import { mockedCartItem } from 'app/modules/landing/cart/spec-files/mocked';
import { ErrorsService } from 'app/core/errors/errors.service';

describe('CartComponent', () => {
  let component: CartComponent;
  let fixture: ComponentFixture<CartComponent>;
  const cartServiceMock = jasmine.createSpyObj('CartService', ['getCartItems', 'getItemsSum', 'removeCartItem', 'addItemToCart', 'getItemsCount']);
  const activatedRouteMock = jasmine.createSpyObj('ActivatedRoute', ['']);
  const routerMock = jasmine.createSpyObj('Router', ['navigateByUrl']);
  const authServiceMock = jasmine.createSpyObj('AuthService', ['check', 'updateWalletAddresses']);
  const errorsServiceMock = jasmine.createSpyObj('ErrorsService', ['openSnackBar']);

  activatedRouteMock.snapshot = {
    queryParamMap: {
      get: (redirectUrl) => '/bookcoin/sign-in'
    }
  };
  authServiceMock.check.and.returnValue(of(true));
  cartServiceMock.getCartItems.and.returnValue([]);
  cartServiceMock.getItemsSum.and.returnValue(0);

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [CartComponent],
      imports: [HttpClientTestingModule],
      providers: [
        { provide: CartService, useValue: cartServiceMock },
        { provide: ActivatedRoute, useValue: activatedRouteMock },
        { provide: ErrorsService, useValue: errorsServiceMock },

        { provide: Router, useValue: routerMock },
        { provide: HttpClient },
        { provide: AuthService, useValue: authServiceMock },
        { provide: BsModalService }
      ]
    }).compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(CartComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  afterEach(() => {
    fixture.destroy();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should romove product from the cart', () => {
    const spyRemoveProduct = cartServiceMock.removeCartItem.and.callThrough();
    const spyAddItem = cartServiceMock.addItemToCart.and.callThrough();
    (component as any)._cartService.addItemToCart(mockedCartItem);

    component.removeProductFromCart(mockedCartItem._id);

    expect(spyRemoveProduct).toHaveBeenCalledTimes(1);
    expect(spyAddItem).toHaveBeenCalled();
  });

  describe('checkout', () => {
    it('should redirect to sign in page when user is not logged in', () => {
      component.loggedIn = false;
      component.checkOut();

      expect(routerMock.navigateByUrl).toHaveBeenCalledWith('/bookcoin/sign-in');
    });

    it('should navigate to checkout', () => {
      cartServiceMock.getItemsCount.and.returnValue(1);
      const spyShow = spyOn((component as any).modalService, 'show');
      component.loggedIn = true;

      component.checkOut();

      expect(routerMock.navigateByUrl).toHaveBeenCalledWith('/checkout/USD');
    });
  });

  describe('checkout', () => {
    it('should redirect to sign in page when user is not logged in', () => {
      component.loggedIn = false;
      component.checkOutEth();

      expect(routerMock.navigateByUrl).toHaveBeenCalledWith('/bookcoin/sign-in');
    });

    it('should navigate to order complete', () => {
      cartServiceMock.getItemsCount.and.returnValue(1);
      const spyShow = spyOn((component as any).modalService, 'show');
      component.loggedIn = true;

      component.checkOutEth();

      expect(routerMock.navigateByUrl).toHaveBeenCalledWith('/order-completed/ETH');
    });
  });
});
