import { ComponentFixture, TestBed } from '@angular/core/testing';
import { PaymentDetailsPopupComponent } from './payment-details-popup.component';
import { BsModalService } from 'ngx-bootstrap/modal';
import { AuthService } from 'app/core/auth/auth.service';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { CartService } from 'app/core/cart/cart.service';
import { RouterTestingModule } from '@angular/router/testing';
import { AbstractControl, FormBuilder } from '@angular/forms';
import { ReactiveFormsModule } from '@angular/forms';
import { MatDialog, MatDialogRef } from '@angular/material/dialog';
import { of, throwError } from 'rxjs';
import { mockedNftCard, mockUser } from 'app/core/auction/spec-files/mocked';
import { WizardDialogService } from 'app/shared/wizard-dialog-service/wizard-dialog.service';
import { PaymentService } from 'app/core/payment/payment.service';
import { Router } from '@angular/router';

describe('PaymentDetailsPopupComponent', () => {
  let component: PaymentDetailsPopupComponent;
  let fixture: ComponentFixture<PaymentDetailsPopupComponent>;
  const authServiceMock = jasmine.createSpyObj('AuthService', ['user']);
  const matDialogMock = jasmine.createSpyObj('MatDialog', ['close', 'closeAll', 'open']);
  const matDialogRefMock = jasmine.createSpyObj('MatDialog', ['afterClosed', 'close']);
  const wizardServiceMock = jasmine.createSpyObj('WizardDialogService', ['advanceStages', 'showWizard', 'close', 'failStage']);
  const paymentServiceMock = jasmine.createSpyObj('PaymentService', ['processPayment']);
  const cartServiceMock = jasmine.createSpyObj('CartService', ['getItemsSum', 'getCards', 'setCompletedOrder', 'placeOrder']);
  const routerMock = jasmine.createSpyObj('Router', ['navigateByUrl']);

  cartServiceMock.getCards.and.returnValue(
    of({
      data: []
    })
  );
  cartServiceMock.getItemsSum.and.returnValue(1);
  authServiceMock.user = mockUser;

  const mockedCard = {
    cardId: '112',
    cardNumber: '1234 4569 0987 1234',
    expMonth: 10,
    expYear: 2030,
    csv: 123,
    userId: 'testId'
  };

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [PaymentDetailsPopupComponent],
      imports: [HttpClientTestingModule, RouterTestingModule, ReactiveFormsModule],
      providers: [
        { provide: AuthService, useValue: authServiceMock },
        { provide: BsModalService },
        { provide: FormBuilder },
        { provide: CartService, useValue: cartServiceMock },
        { provide: MatDialog, useValue: matDialogMock },
        { provide: MatDialogRef, useValue: matDialogRefMock },
        { provide: WizardDialogService, useValue: wizardServiceMock },
        { provide: PaymentService, useValue: paymentServiceMock },
        { provide: Router, useValue: routerMock }
      ]
    }).compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(PaymentDetailsPopupComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should sucessfully get user cards from cart service', () => {
    component.getUserCards();

    expect(cartServiceMock.getCards).toHaveBeenCalled();
    expect(component.cards).toEqual([]);
  });

  it('should select the saved card', () => {
    const event = {
      value: mockedCard
    };

    component.selectSavedCard(event);

    expect(component.paymentDetailsForm.value.cardNumber).toEqual(mockedCard.cardNumber);
    expect(component.paymentDetailsForm.value.csv).toEqual(mockedCard.csv);
  });

  it('should fill out the form wth test data', () => {
    component.fillTestData();

    expect(component.paymentDetailsForm.valid).toBeTruthy();
    expect(component.paymentDetailsForm.value.cardNumber).toEqual('4007400000000007');
    expect(component.paymentDetailsForm.value.csv).toEqual(123);
  });

  it('should open a dialog with provided error', () => {
    (component as any).processingDialog = {
      close: () => {}
    };
    matDialogMock.open.and.returnValue(matDialogRefMock);
    const err = { message: 'Test Error' };
    matDialogRefMock.afterClosed.and.returnValue(of(err.message));

    component.showError(err.message);

    expect(matDialogMock.open).toHaveBeenCalled();
  });

  it('should respond open a mat dialog', () => {
    matDialogMock.open.and.returnValue(matDialogRefMock);
    matDialogRefMock.afterClosed.and.returnValue(of({}));

    component.showProcessing();

    expect(matDialogRefMock.afterClosed).toHaveBeenCalled();
  });

  it('should get user successfully', () => {
    const response = component.getUser();

    expect(response).toEqual(mockUser);
  });

  describe('isInvalid', () => {
    it('should return false', () => {
      component.paymentDetailsForm.controls['cardNumber'].setValue('123456789032');
      const response = component.isInvalid(component.paymentDetailsForm.controls.cardNumber);

      expect(response).toEqual(false);
    });

    it('should return false', () => {
      component.paymentDetailsForm.controls['cardNumber'].setValue(null);
      const response = component.isInvalid(component.paymentDetailsForm.controls.cardNumber);

      expect(response).toEqual(false);
    });

    describe('processPayment', () => {
      let expectedResponse;

      beforeEach(() => {
        expectedResponse = {
          status: 'success',
          description: 'Some description'
        };
        spyOn(component, 'showError');
      });
      it('should place order sucessfully', async () => {
        component.fillTestData();
        paymentServiceMock.processPayment.and.resolveTo(expectedResponse);
        cartServiceMock.placeOrder.and.returnValue(of({ data: {} }));

        await component.processPayment();

        expect(wizardServiceMock.advanceStages).toHaveBeenCalled();
        expect(routerMock.navigateByUrl).toHaveBeenCalledWith('/order-success');
      });

      it('should respond with an error if from is invalid', async () => {
        paymentServiceMock.processPayment.and.resolveTo(expectedResponse);
        cartServiceMock.placeOrder.and.returnValue(of({ data: {} }));

        await component.processPayment();

        expect(component.showError).toHaveBeenCalledWith('Something went wrong. Please check form for validation errors.');
      });

      it('should respond with an error if payment processing failed', async () => {
        component.fillTestData();
        expectedResponse.status = 'failed';
        paymentServiceMock.processPayment.and.resolveTo(expectedResponse);
        cartServiceMock.placeOrder.and.returnValue(of({ data: {} }));

        await component.processPayment();

        expect(wizardServiceMock.advanceStages).toHaveBeenCalled();
        expect(component.showError).toHaveBeenCalledWith(`Payment failed. ${expectedResponse.description}`);
      });

      it('should respond with an error if order placement fails', async () => {
        component.fillTestData();
        paymentServiceMock.processPayment.and.resolveTo(expectedResponse);
        const err = {
          error: {
            message: 'Failed to Place Order'
          }
        };
        const expectedMessage = `There was an error attempting to finalize order after payment was successful. ${err.error.message}. with message ${err.error.message}`;
        cartServiceMock.placeOrder.and.returnValue(throwError(err));

        await component.processPayment();

        expect(wizardServiceMock.advanceStages).toHaveBeenCalled();
      });
    });
  });
});
