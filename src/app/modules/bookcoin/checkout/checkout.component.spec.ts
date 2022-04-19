import { ComponentFixture, TestBed } from '@angular/core/testing';
import { FormBuilder } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
import { CartService } from 'app/core/cart/cart.service';
import { CheckoutComponent } from './checkout.component';
import { of } from 'rxjs';
import { PaymentService } from 'app/core/payment/payment.service';
import { AngularFireAuthModule } from '@angular/fire/compat/auth';
import { AngularFireModule } from '@angular/fire/compat';
import { environment } from 'environments/environment';
import { RouterTestingModule } from '@angular/router/testing';
import { HttpClientTestingModule } from '@angular/common/http/testing';

describe('CheckoutComponent', () => {
  let component: CheckoutComponent;
  let fixture: ComponentFixture<CheckoutComponent>;
  const mockedCard = {
    cardId: '1234',
    cardNumber: '123456789012',
    expMonth: 3,
    expYear: 2023,
    userId: 'someUserId'
  };

  const cartServiceMock = jasmine.createSpyObj('CartService', ['addItemToCart', 'getCards']);
  const routerMock = jasmine.createSpyObj('Router', ['url', 'navigateByUrl'], ['get']);
  routerMock.url = 'testUrl';
  cartServiceMock.getCards.and.returnValue(of([]));
  const activatedRouteMock = jasmine.createSpyObj('ActivatedRoute', ['snapshot']);
  activatedRouteMock.snapshot = { params: { paymentType: 'USD' } };

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [CheckoutComponent],
      imports: [HttpClientTestingModule, AngularFireModule.initializeApp(environment.firebase), AngularFireAuthModule],
      providers: [
        { provide: CartService, useValue: cartServiceMock },
        { provide: ActivatedRoute, useValue: activatedRouteMock },
        { provide: PaymentService },
        { provide: Router, useValue: routerMock },
        { provide: FormBuilder }
      ]
    }).compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(CheckoutComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  afterEach(() => {
    fixture.destroy();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should get cards for a specific user', () => {
    const expectedResponse = {
      data: [mockedCard]
    };
    cartServiceMock.getCards.and.returnValue(of(expectedResponse));

    component.getUserCards();

    expect(cartServiceMock.getCards).toHaveBeenCalled();
  });

  describe('ProceedToOrder', () => {
    it('should return if checkout form is invalid', () => {
      component.ProceedToOrder();

      expect(component.checkoutForm.invalid).toBe(true);
    });

    it('should redirect to completed order component', () => {
      component.fillTestData();
      component.ProceedToOrder();

      expect(routerMock.navigateByUrl).toHaveBeenCalledWith('order-completed/USD');
    });
  });

  it('should select the given saved card', () => {
    component.selectSavedCard({ value: mockedCard });

    expect(component.checkoutForm.controls['selectedCard'].value).toEqual(mockedCard.cardId);
    expect(component.checkoutForm.controls['cardNumber'].value).toEqual(mockedCard.cardNumber);
  });
});
