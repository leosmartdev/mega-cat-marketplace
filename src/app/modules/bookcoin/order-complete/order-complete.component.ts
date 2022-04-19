import { Component, OnInit, Inject } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { CartService } from 'app/core/cart/cart.service';
import { PaymentService } from 'app/core/payment/payment.service';
import { AuthService } from 'app/core/auth/auth.service';
import { SharedService } from 'app/core/shared/shared.service';
import { BillingDetails } from 'app/core/payment/billing-details';
import { CardDetails } from 'app/core/payment/card-details';
import { BillingResponse } from 'app/core/payment/billing-response';
import { MatDialog, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { WizardStage } from 'app/shared/wizard-dialog-service/wizard-stage.model';
import { WizardDialogService } from 'app/shared/wizard-dialog-service/wizard-dialog.service';
import { BsModalService } from 'ngx-bootstrap/modal';
import { DatePipe } from '@angular/common';
import { ErrorsService } from 'app/core/errors/errors.service';
import { WalletService } from 'app/core/wallet/wallet.service';

@Component({
  selector: 'app-order-complete',
  templateUrl: './order-complete.component.html',
  styleUrls: ['./order-complete.component.scss']
})
export class OrderCompleteComponent implements OnInit {
  products = [];
  card;
  loggedIn: boolean;
  myDate: string | Date = new Date();
  etherToUsdExchangeRate = 1.87; // TODO: Get a service to calculate this in real-time
  total = 0;
  processingFee: number;
  paymentType: string;

  constructor(
    private errorsService: ErrorsService,
    private walletService: WalletService,
    private sharedService: SharedService,
    private cartService: CartService,
    private authService: AuthService,
    private router: Router,
    private activatedRoute: ActivatedRoute,
    private paymentService: PaymentService,
    private dialog: MatDialog,
    private wizardService: WizardDialogService,
    private modalService: BsModalService,
    private datePipe: DatePipe
  ) {}

  ngOnInit(): void {
    this.authService.check().subscribe((authenticated) => {
      this.loggedIn = authenticated;
    });
    this.myDate = this.datePipe.transform(this.myDate, 'MMMM d, y');
    this.sharedService.url.next(this.router.url);
    this.products = this.cartService.getCartItems();
    this.paymentType = this.activatedRoute.snapshot.params['paymentType'];
    this.card = this.paymentService.card;
    console.log(this.card.saveCard);

    this.processingFee = this.cartService.cardProcessingFee;
    //eslint-disable-next-line @typescript-eslint/naming-convention
    this.cartService.getEthPriceInUsd().subscribe((data) => {
      //eslint-disable-next-line @typescript-eslint/naming-convention
      this.etherToUsdExchangeRate = 1 / data.ETH.USD;
    });

    this.computeTotal();
  }

  getProductsSum(): number {
    return this.cartService.getItemsSum();
  }

  computeTotal() {
    const cartTotal = this.getProductsSum();
    // check if cart total is empty
    if (this.getProductsSum() === 0) {
      return;
    }
    this.total = parseFloat((this.getProductsSum() + this.processingFee).toFixed(5));
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

    const card = this.card;
    if (this.card) {
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
        new CardDetails(card.cardNumber.toString(), card.csv),
        card.saveCard
      );
      this.wizardService.advanceStages();

      if (response.status !== 'failed' && response.status !== 'action_required') {
        this.cartService.placeOrder().subscribe(
          (orderStatusesResponse) => {
            this.wizardService.advanceStages();
            this.cartService.setCompletedOrder(orderStatusesResponse.data);
            this.modalService.hide();
            localStorage.removeItem('cart');
            this.cartService.cartItems = [];
            this.router.navigateByUrl('/profile');
          },
          (errorResponse) => {
            const message = errorResponse.message;
            const error = errorResponse.error;
            const alert = `There was an error attempting to finalize order after payment was successful. ${error.message}. with message ${message}`;
            console.error(alert);
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

  showError(message: string) {
    // eslint-disable-next-line @typescript-eslint/no-unused-expressions
    const dialogRef = this.dialog.open(PaymentFailedDialogComponent, {
      data: message
    });
    dialogRef.afterClosed().subscribe((result) => {
      console.log(`Dialog result: ${result}`);
      this.dialog.closeAll();
    });
  }

  orderType() {
    if (this.paymentType === 'USD') {
      return true;
    }
    return false;
  }

  checkoutWithEthereum() {
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

    if (this.loggedIn) {
      if (this.products && this.products.length > 0) {
        this.cartService.generateBlockChainAddress().subscribe(
          (data) => {
            this.wizardService.showWizard('Payment Processing', stages);
            this.wizardService.advanceStages();
            console.log(data.data.address);
            console.log(this.total);
            this.walletService
              .sendEthereum(data.data.address, (this.total * this.etherToUsdExchangeRate).toFixed(18))
              .then((txHash) => {
                console.log(`Transaction Hash for send_ethTransaction is ${txHash}. Setting up wait for confirmations`);
                this.walletService
                  .waitTransaction(txHash, 4, {
                    interval: 200,
                    blocksToWait: 4
                  })
                  .then((transactionReceipt) => {
                    console.log('Success! Transaction confirmed! See receipt', transactionReceipt);
                    this.wizardService.advanceStages();
                    this.cartService.placeOrder().subscribe(
                      (orderStatusesResponse) => {
                        this.wizardService.advanceStages();
                        this.cartService.setCompletedOrder(orderStatusesResponse.data);
                        localStorage.removeItem('cart');
                        this.cartService.cartItems = [];
                        this.router.navigateByUrl('/profile');
                      },
                      (errorResponse) => {
                        const message = errorResponse.message;
                        const error = errorResponse.error;
                        const alert = `There was an error attempting to finalize order after payment was successful. ${error.message}. with message ${message}`;
                        console.error(alert);
                      }
                    );
                  })
                  .catch((error) => {
                    console.error('Failed to confirm transaction.', error);
                    this.wizardService.close();
                    console.error(error);
                    this.errorsService.openSnackBar('Transfer Failed!', 'Error');
                  });
              })
              .catch((error) => {
                this.wizardService.close();
                console.error(error);
                this.errorsService.openSnackBar('Transfer Failed!', 'Error');
              });
          },
          (error) => {
            console.log(error);
          }
        );
        /* this.cartService.placeOrder().subscribe(
            () => {
                localStorage.removeItem('cart');
                const redirectURL =
                    this.activatedRoute.snapshot.queryParamMap.get(
                        'redirectURL'
                    ) || '/market';
                // Navigate to the redirect url
                this.products = [];
                this.router.navigateByUrl(redirectURL);
            },
            (response) => {
                console.log('response', response);
            }
        ); */
      } else {
        this.errorsService.openSnackBar('Cart Is Empty!', 'Error');
      }
    } else {
      const redirectURL = this.activatedRoute.snapshot.queryParamMap.get('redirectURL') || '/sign-in';
      // Navigate to the redirect url
      this.router.navigateByUrl(redirectURL);
    }
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
