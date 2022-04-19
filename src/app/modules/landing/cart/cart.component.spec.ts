/* eslint-disable @typescript-eslint/naming-convention */
import { ComponentFixture, fakeAsync, flushMicrotasks, TestBed } from '@angular/core/testing';
import { CartService } from 'app/core/cart/cart.service';
import { AuthService } from 'app/core/auth/auth.service';
import { CartComponent } from './cart.component';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { RouterTestingModule } from '@angular/router/testing';
import { BsModalService } from 'ngx-bootstrap/modal';
import { FormBuilder } from '@angular/forms';
import { of, throwError } from 'rxjs';
import { ErrorsService } from '../../../core/errors/errors.service';
import { WalletService } from '../../../core/wallet/wallet.service';
import { MatDialog } from '@angular/material/dialog';
import { ActivatedRoute, Router } from '@angular/router';
import { mockedCartItem } from './spec-files/mocked';
import { WizardDialogService } from 'app/shared/wizard-dialog-service/wizard-dialog.service';

describe('CartComponent', () => {
  let component: CartComponent;
  let fixture: ComponentFixture<CartComponent>;
  const activatedRouteMock = jasmine.createSpyObj('ActivatedRoute', ['snapshot']);
  activatedRouteMock.snapshot = {
    queryParamMap: {
      get: (redirectUrl) => '/sign-in'
    }
  };

  const authServiceMock = jasmine.createSpyObj('AuthService', ['check', 'updateWalletAddresses', 'updateLinkedWalletAddresses']);
  authServiceMock.check.and.returnValue(of(true));
  authServiceMock.updateWalletAddresses.and.returnValue(of(null));
  authServiceMock.updateLinkedWalletAddresses.and.returnValue(of(null));
  const matDialogMock = jasmine.createSpyObj('MatDialog', ['close', 'closeAll']);
  const errorsServiceMock = jasmine.createSpyObj('ErrorsService', ['openSnackBar']);
  const cartServiceMock = jasmine.createSpyObj('CartService', [
    'cardProcessingFee',
    'getCartItems',
    'getItemsSum',
    'getEthPriceInUsd',
    'removeCartItem',
    'addItemToCart',
    'getCards',
    'generateBlockChainAddress',
    'placeOrder',
    'setCompletedOrder'
  ]);
  const routerMock = jasmine.createSpyObj('Router', ['navigateByUrl']);
  const wizardDialogMock = jasmine.createSpyObj('WizardDialogService', ['advanceStages', 'showWizard', 'close']);
  cartServiceMock.getCards.and.returnValue(of({}));
  cartServiceMock.getCartItems.and.returnValue([]);
  cartServiceMock.cardProcessingFee = 2;
  cartServiceMock.getItemsSum.and.returnValue(0);
  cartServiceMock.getEthPriceInUsd.and.returnValue(of({ ETH: { USD: 0.00023 } }));
  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [CartComponent],
      imports: [HttpClientTestingModule, RouterTestingModule],
      providers: [
        { provide: AuthService, useValue: authServiceMock },
        { provide: CartService, useValue: cartServiceMock },
        { provide: BsModalService },
        { provide: FormBuilder },
        { provide: WalletService },
        { provide: WizardDialogService, useValue: wizardDialogMock },
        { provide: ErrorsService, useValue: errorsServiceMock },
        { provide: MatDialog, useValue: matDialogMock },
        { provide: ActivatedRoute, useValue: activatedRouteMock },
        { provide: Router, useValue: routerMock }
      ]
    }).compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(CartComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should romove product from the cart', () => {
    const spyRemoveProduct = cartServiceMock.removeCartItem.and.callThrough();
    const spyAddItem = cartServiceMock.addItemToCart.and.callThrough();
    (component as any).cartService.addItemToCart(mockedCartItem);

    component.removeProductFromCart(mockedCartItem._id);

    expect(spyRemoveProduct).toHaveBeenCalledTimes(1);
    expect(spyAddItem).toHaveBeenCalled();
  });

  it('should return the items sum in the cart', () => {
    const res = component.getProductsSum();

    expect(res).toEqual(0);
  });

  it('should increase quantity of an item in cart', () => {
    component.products = [mockedCartItem];

    component.addQuantity(0);

    expect(component.products.length).toEqual(1);
    expect(component.products[0].count).toEqual(mockedCartItem.count);
  });

  it('should reduce the quantity of an item in cart', () => {
    component.products = [mockedCartItem];
    component.reduceQuantity(0);

    expect(component.products.length).toEqual(1);
    expect(component.products[0].count).toEqual(mockedCartItem.count);
  });

  describe('checkout', () => {
    it('should redirect to sign in page when user is not logged in', () => {
      component.loggedIn = false;
      component.checkOut();

      expect(routerMock.navigateByUrl).toHaveBeenCalledWith('/sign-in');
    });

    it('should respond with snackbar when cart is empty', () => {
      component.loggedIn = true;
      component.products = [];
      component.checkOut();

      expect(errorsServiceMock.openSnackBar).toHaveBeenCalledWith('Cart Is Empty!', 'Error');
    });

    it('should display payment details component on checkout', () => {
      const spyShow = spyOn((component as any).modalService, 'show');
      component.loggedIn = true;
      component.products.push(mockedCartItem);
      component.checkOut();

      expect(spyShow).toHaveBeenCalled();
    });
  });
  describe('checkoutWithEthereum', () => {
    it('should redirect to sign in page when user is not logged in', () => {
      component.loggedIn = false;
      component.checkoutWithEthereum();
      expect(routerMock.navigateByUrl).toHaveBeenCalledWith('/sign-in');
    });

    it('should respond with snackbar when cart is empty', () => {
      component.loggedIn = true;
      component.products = [];
      component.checkoutWithEthereum();

      expect(errorsServiceMock.openSnackBar).toHaveBeenCalledWith('Cart Is Empty!', 'Error');
    });

    it('should place order', async () => {
      const mockData = {
        data: {
          address: 'test address'
        }
      };
      spyOn((component as any).walletService, 'sendEthereum').and.returnValue(Promise.resolve({}));
      spyOn((component as any).walletService, 'waitTransaction').and.returnValue(Promise.resolve({}));
      component.loggedIn = true;
      cartServiceMock.generateBlockChainAddress.and.returnValue(of(mockData));
      cartServiceMock.placeOrder.and.returnValue(of({ data: {} }));
      component.products.push(mockedCartItem);

      await component.checkoutWithEthereum();
      await Promise.resolve();

      expect(wizardDialogMock.advanceStages).toHaveBeenCalled();
      expect(routerMock.navigateByUrl).toHaveBeenCalledWith('/order-success');
    });

    it('should log an error if order is not placed correctly', fakeAsync(() => {
      const mockData = {
        data: {
          address: 'test address'
        }
      };
      const mockedError = {
        message: 'Failed to place order',
        error: {
          message: 'One or more itms failed'
        }
      };
      const expectedResponse = `There was an error attempting to finalize order after payment was successful. ${mockedError.error.message}. with message ${mockedError.message}`;
      spyOn((component as any).walletService, 'sendEthereum').and.returnValue(Promise.resolve({}));
      spyOn((component as any).walletService, 'waitTransaction').and.returnValue(Promise.resolve({}));
      component.loggedIn = true;
      cartServiceMock.generateBlockChainAddress.and.returnValue(of(mockData));
      cartServiceMock.placeOrder.and.returnValue(throwError(mockedError));
      component.products.push(mockedCartItem);

      component.checkoutWithEthereum();
      flushMicrotasks();

      expect(wizardDialogMock.advanceStages).toHaveBeenCalled();
    }));

    it('should log an error if transaction is not confirmed', fakeAsync(() => {
      const mockData = {
        data: {
          address: 'test address'
        }
      };
      spyOn((component as any).walletService, 'sendEthereum').and.returnValue(Promise.resolve({}));
      spyOn((component as any).walletService, 'waitTransaction').and.rejectWith('Something went wrong!');
      component.loggedIn = true;
      cartServiceMock.generateBlockChainAddress.and.returnValue(of(mockData));
      component.products.push(mockedCartItem);

      component.checkoutWithEthereum();
      flushMicrotasks();

      expect(wizardDialogMock.advanceStages).toHaveBeenCalled();
      expect(errorsServiceMock.openSnackBar).toHaveBeenCalledWith('Transfer Failed!', 'Error');
    }));

    it('should log an error if ethereum transfer fails', fakeAsync(() => {
      const mockData = {
        data: {
          address: 'test address'
        }
      };
      spyOn((component as any).walletService, 'sendEthereum').and.rejectWith('Transfer Failed!');
      component.loggedIn = true;
      cartServiceMock.generateBlockChainAddress.and.returnValue(of(mockData));
      component.products.push(mockedCartItem);

      component.checkoutWithEthereum();
      flushMicrotasks();

      expect(wizardDialogMock.advanceStages).toHaveBeenCalled();
      expect(errorsServiceMock.openSnackBar).toHaveBeenCalledWith('Transfer Failed!', 'Error');
    }));

    it('should log an error if blockchain address is not generated correctly', () => {
      spyOn(console, 'log');
      component.loggedIn = true;
      cartServiceMock.generateBlockChainAddress.and.returnValue(throwError('Failed to generate blockchain address!'));
      component.products.push(mockedCartItem);

      component.checkoutWithEthereum();

      expect(console.log).toHaveBeenCalledWith('Failed to generate blockchain address!');
    });
  });

  it('should toggle the is agree check', () => {
    component.isAgree = false;
    component.termsCheck();
    expect(component.isAgree).toEqual(true);
  });
});
