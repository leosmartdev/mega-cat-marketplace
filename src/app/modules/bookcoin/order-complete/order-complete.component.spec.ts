import { ComponentFixture, fakeAsync, flushMicrotasks, TestBed } from '@angular/core/testing';
import { ErrorsService } from 'app/core/errors/errors.service';
import { OrderCompleteComponent } from './order-complete.component';
import { WalletService } from 'app/core/wallet/wallet.service';
import { ActivatedRoute, Router } from '@angular/router';
import { CartService } from 'app/core/cart/cart.service';
import { AuthService } from 'app/core/auth/auth.service';
import { MatDialog, MatDialogRef } from '@angular/material/dialog';
import { PaymentService } from 'app/core/payment/payment.service';
import { BsModalService } from 'ngx-bootstrap/modal';
import { DatePipe } from '@angular/common';
import { of, throwError } from 'rxjs';
import { WizardDialogService } from 'app/shared/wizard-dialog-service/wizard-dialog.service';
import { mockedCartItem } from 'app/modules/landing/cart/spec-files/mocked';
import { mockedPaymentCard } from 'app/core/payment/spec-files/mocked';

describe('OrderCompleteComponent', () => {
  let component: OrderCompleteComponent;
  let fixture: ComponentFixture<OrderCompleteComponent>;

  const errorsServiceMock = jasmine.createSpyObj('ErrorService', ['openSnackBar']);
  const walletServiceMock = jasmine.createSpyObj('WalletService', ['isWalletActive', 'connectToMetaMask', 'sendEthereum', 'waitTransaction']);
  const cartServiceMock = jasmine.createSpyObj('CartService', ['getCartItems', 'getEthPriceInUsd', 'getItemsSum', 'generateBlockChainAddress', 'placeOrder', 'setCompletedOrder']);
  const authServiceMock = jasmine.createSpyObj('AuthService', ['check']);
  const routerMock = jasmine.createSpyObj('Router', ['navigateByUrl']);
  const activatedRouteMock = jasmine.createSpyObj('ActivatedRoute', ['snapshot']);
  const paymentServiceMock = jasmine.createSpyObj('PaymentService', ['processPayment', 'card']);
  const matDialogMock = jasmine.createSpyObj('MatDialog', ['close', 'closeAll', 'open']);
  const matDialogRefMock = jasmine.createSpyObj('MatDialogRef', ['afterClosed']);
  const wizardDialogMock = jasmine.createSpyObj('WizardDialogService', ['advanceStages', 'showWizard', 'close']);

  cartServiceMock.getCartItems.and.returnValue([]);
  cartServiceMock.getEthPriceInUsd.and.returnValue(of({ ETH: { USD: 10 } }));
  cartServiceMock.getItemsSum.and.returnValue(10);
  activatedRouteMock.snapshot = {
    params: { paymentType: 'USD' },
    queryParamMap: {
      get: (redirectUrl) => '/sign-in'
    }
  };
  paymentServiceMock.card = mockedPaymentCard;
  authServiceMock.check.and.returnValue(of(true));

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [OrderCompleteComponent],
      providers: [
        { provide: ErrorsService, useValue: errorsServiceMock },
        { provide: WalletService, useValue: walletServiceMock },
        { provide: Router, useValue: routerMock },
        { provide: CartService, useValue: cartServiceMock },
        { provide: AuthService, useValue: authServiceMock },
        { provide: Router, useValue: routerMock },
        { provide: ActivatedRoute, useValue: activatedRouteMock },
        { provide: MatDialog, useValue: matDialogMock },
        { provide: WizardDialogService, useValue: wizardDialogMock },
        { provide: PaymentService, useValue: paymentServiceMock },
        { provide: BsModalService },
        { provide: MatDialogRef, useValue: matDialogRefMock },
        { provide: DatePipe }
      ]
    }).compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(OrderCompleteComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
    let store = {};
    const mockLocalStorage = {
      getItem: (key: string): string => (key in store ? store[key] : null),
      setItem: (key: string, value: string) => {
        store[key] = `${value}`;
      },
      removeItem: (key: string) => {
        delete store[key];
      },
      clear: () => {
        store = {};
      }
    };

    spyOn(localStorage, 'getItem').and.callFake(mockLocalStorage.getItem);
    spyOn(localStorage, 'setItem').and.callFake(mockLocalStorage.setItem);
    spyOn(localStorage, 'removeItem').and.callFake(mockLocalStorage.removeItem);
    spyOn(localStorage, 'clear').and.callFake(mockLocalStorage.clear);
  });

  afterEach(() => {
    fixture.destroy();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
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
      walletServiceMock.sendEthereum.and.returnValue(Promise.resolve({}));
      walletServiceMock.waitTransaction.and.returnValue(Promise.resolve({}));
      component.loggedIn = true;
      cartServiceMock.generateBlockChainAddress.and.returnValue(of(mockData));
      cartServiceMock.placeOrder.and.returnValue(of({ data: {} }));
      component.products.push(mockedCartItem);

      await component.checkoutWithEthereum();
      await Promise.resolve();

      expect(wizardDialogMock.advanceStages).toHaveBeenCalled();
      expect(routerMock.navigateByUrl).toHaveBeenCalledWith('/profile');
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
          message: 'One or more items failed'
        }
      };
      const expectedResponse = `There was an error attempting to finalize order after payment was successful. ${mockedError.error.message}. with message ${mockedError.message}`;
      walletServiceMock.sendEthereum.and.returnValue(Promise.resolve({}));
      walletServiceMock.waitTransaction.and.returnValue(Promise.resolve({}));
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
      walletServiceMock.sendEthereum.and.returnValue(Promise.resolve({}));
      walletServiceMock.waitTransaction.and.rejectWith('Something went wrong!');
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
      walletServiceMock.sendEthereum.and.rejectWith('Transfer Failed!');
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

  it('should return if there is no product in the order', () => {
    cartServiceMock.getItemsSum.and.returnValue(0);

    component.computeTotal();

    expect(component.total).toEqual(NaN);
  });

  it('should return true if payment method is USD', () => {
    localStorage.setItem('paymentMethod', 'USD');
    activatedRouteMock.snapshot.params.paymentType = 'USD';

    expect(component.orderType()).toBe(true);
  });

  it('should return false if payment method is not USD', () => {
    component.paymentType = 'ETH';

    expect(component.orderType()).toBe(false);
  });

  describe('ProcessPayment', () => {
    let expectedResponse;

    beforeEach(() => {
      expectedResponse = {
        status: 'success',
        description: 'Some description'
      };
      spyOn(component, 'showError');
      component.card = mockedPaymentCard;
    });

    it('should place order successfully', async () => {
      paymentServiceMock.processPayment.and.resolveTo(expectedResponse);
      cartServiceMock.placeOrder.and.returnValue(of({ data: {} }));

      await component.processPayment();

      expect(wizardDialogMock.advanceStages).toHaveBeenCalled();
      expect(routerMock.navigateByUrl).toHaveBeenCalledWith('/profile');
    });

    it('should respond with an error if card is invalid', async () => {
      component.card = null;

      await component.processPayment();

      expect(component.showError).toHaveBeenCalledWith('Something went wrong. Please check form for validation errors.');
    });

    it('should respond with an error if payment processing failed', async () => {
      expectedResponse.status = 'failed';
      paymentServiceMock.processPayment.and.resolveTo(expectedResponse);
      cartServiceMock.placeOrder.and.returnValue(of({ data: {} }));

      await component.processPayment();

      expect(wizardDialogMock.advanceStages).toHaveBeenCalled();
      expect(component.showError).toHaveBeenCalledWith(`Payment failed. ${expectedResponse.description}`);
    });

    it('should respond with an error if order placement fails', async () => {
      paymentServiceMock.processPayment.and.resolveTo(expectedResponse);
      const err = {
        error: {
          message: 'Failed to Place Order'
        },
        message: 'Failed to Place Order'
      };
      const expectedMessage = `There was an error attempting to finalize order after payment was successful. ${err.error.message}. with message ${err.error.message}`;
      cartServiceMock.placeOrder.and.returnValue(throwError(err));

      await component.processPayment();

      expect(wizardDialogMock.advanceStages).toHaveBeenCalled();
    });
  });

  it('should open a dialog with provided error', () => {
    matDialogMock.open.and.returnValue(matDialogRefMock);
    const err = { message: 'Test Error' };
    matDialogRefMock.afterClosed.and.returnValue(of(err.message));

    component.showError(err.message);
    expect(matDialogMock.closeAll).toHaveBeenCalled();
  });
});
