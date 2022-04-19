import { Component, Inject, OnDestroy, OnInit } from '@angular/core';
import { AbstractControl, FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { AuthService } from 'app/core/auth/auth.service';
import { BsModalService } from 'ngx-bootstrap/modal';
import { User } from '../../../core/user/user.types';
import { CartService } from 'app/core/cart/cart.service';
import { PaymentService } from '../../../core/payment/payment.service';
import { BillingDetails } from 'app/core/payment/billing-details';
import { BillingResponse } from 'app/core/payment/billing-response';
import { MatDialog, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { WizardStage } from 'app/shared/wizard-dialog-service/wizard-stage.model';
import { WizardDialogService } from 'app/shared/wizard-dialog-service/wizard-dialog.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-payment-details-popup',
  templateUrl: './payment-details-popup.component.html',
  styleUrls: ['./payment-details-popup.component.scss']
})
export class PaymentDetailsPopupComponent implements OnInit, OnDestroy {
  formFieldHelpers: string[] = [''];
  public cards: [] = [];
  public user;
  paymentDetailsForm: FormGroup;
  public cardNumber: string = null;
  public expiryMonth: number = null;
  public expiryYear: number = null;
  public csv: number = null;

  public name: string = null;
  public city: string = null;
  public country: string = null;
  public line1: string = null;
  public line2: string = null;
  public district: string = null;
  public postalCode: string = null;

  public errorMsg: boolean = false;
  public errorMsg1: boolean = false;

  private processingDialog: any;

  constructor(
    private authService: AuthService,
    private modalService: BsModalService,
    private formBuilder: FormBuilder,
    private cartService: CartService,
    private router: Router,
    private paymentService: PaymentService,
    private dialog: MatDialog,
    private wizardService: WizardDialogService
  ) {}

  ngOnInit(): void {
    this.getUserCards();
    this.paymentDetailsForm = this.formBuilder.group({
      selectedCard: null,
      name: [null, Validators.required],
      city: [null, Validators.required],
      country: [null, Validators.required],
      line1: [null, Validators.required],
      line2: [null],
      district: [null, Validators.required],
      postalCode: [null, Validators.required],
      cardNumber: [null, Validators.required],
      expiryMonth: [null, Validators.required],
      expiryYear: [null, Validators.required],
      csv: [null, Validators.required]
    });

    this.user = this.authService.user;
    console.log('auth user', this.user);
  }

  getUserCards(): void {
    this.cartService.getCards().subscribe((data: any) => {
      this.cards = data.data;
    });
  }

  ngOnDestroy(): void {
    if (this.processingDialog) {
      this.processingDialog.close();
    }
  }

  isInvalid(controlForm: AbstractControl) {
    return controlForm.invalid && (controlForm.dirty || controlForm.touched);
  }

  getUser(): User {
    return this.authService.user;
  }

  async processPayment(): Promise<any> {
    const stages: WizardStage[] = [
      {
        name: 'Payment Processing',
        status: 'dormant',
        description: 'Submitting your payment for processing.'
      },
      {
        name: 'Finalizing Order',
        status: 'dormant',
        description: 'Finalizing your order with the blockchain and transferring NFTs.'
      }
    ];

    /*eslint-disable */
    const card = this.paymentDetailsForm.value;
    if (this.paymentDetailsForm.valid) {
      this.wizardService.showWizard('Payment Processing', stages);
      this.wizardService.advanceStages();
      const response: BillingResponse = await this.paymentService.processPayment(
        new BillingDetails(
          card.selectedCard,
          card.name,
          card.city,
          card.country,
          card.line1,
          card.line2,
          card.district,
          card.postalCode,
          this.cartService.getItemsSum(),
          card.expiryMonth,
          card.expiryYear
        ),
        { number: card.cardNumber.toString(), cvv: card.csv },
        true
      );
      this.wizardService.advanceStages();

      if (response.status !== 'failed' && response.status !== 'action_required') {
        this.cartService.placeOrder().subscribe(
          (orderStatusesResponse) => {
            this.wizardService.advanceStages();
            this.cartService.setCompletedOrder(orderStatusesResponse.data);
            this.modalService.hide();
            this.router.navigateByUrl('/order-success');
          },
          (errorResponse) => {
            const error = errorResponse.error;
            const message = error.message;
            const alert = `There was an error attempting to finalize order after payment was successful. ${error.message}. with message ${message}`;
            console.error(alert);
            this.wizardService.failStage({
              message: alert
            });
          }
        );
      } else {
        const message = `Payment failed. ${response.description}`;
        this.showError(message);
      }
    } else {
      this.showError('Something went wrong. Please check form for validation errors.');
    }
  }

  /*eslint-enable */

  showProcessing() {
    this.processingDialog = this.dialog.open(PaymentDialogComponent);
    this.processingDialog.afterClosed().subscribe((result) => {});
  }

  showError(message: string) {
    // eslint-disable-next-line @typescript-eslint/no-unused-expressions
    this.processingDialog ? this.processingDialog.close() : null;
    const dialogRef = this.dialog.open(PaymentFailedDialogComponent, {
      data: message
    });
    dialogRef.afterClosed().subscribe((result) => {
      console.log(`Dialog result: ${result}`);
    });
  }

  fillTestData() {
    this.paymentDetailsForm.controls.name.setValue('John Snow');
    this.paymentDetailsForm.controls.city.setValue('Beaver Falls');
    this.paymentDetailsForm.controls.country.setValue('US');
    this.paymentDetailsForm.controls.line1.setValue('500 Baum Blvd');
    this.paymentDetailsForm.controls.line2.setValue('');
    this.paymentDetailsForm.controls.district.setValue('US');
    this.paymentDetailsForm.controls.postalCode.setValue('15222');
    this.paymentDetailsForm.controls.expiryMonth.setValue(1);
    this.paymentDetailsForm.controls.cardNumber.setValue('4007400000000007');
    this.paymentDetailsForm.controls.csv.setValue(123);
    this.paymentDetailsForm.controls.expiryYear.setValue(2022);
  }

  selectSavedCard(event) {
    console.log(event.value);
    const card = event.value;
    this.paymentDetailsForm.controls.selectedCard.setValue(card.cardId);
    this.paymentDetailsForm.controls.expiryMonth.setValue(card.expMonth);
    this.paymentDetailsForm.controls.cardNumber.setValue(card.cardNumber);
    this.paymentDetailsForm.controls.csv.setValue(card.csv);
    this.paymentDetailsForm.controls.expiryYear.setValue(card.expYear);
  }
}

@Component({
  selector: 'payment-failed-dialog',
  templateUrl: 'payment-failed-dialog.html'
})
export class PaymentFailedDialogComponent {
  constructor(
    @Inject(MAT_DIALOG_DATA)
    public data: {
      message: string;
    }
  ) {}
}

@Component({
  selector: 'payment-update-popup-dialog',
  templateUrl: 'payment-update-popup-dialog.html'
})
export class PaymentDialogComponent {
  constructor(public cartService: CartService) {}
}
