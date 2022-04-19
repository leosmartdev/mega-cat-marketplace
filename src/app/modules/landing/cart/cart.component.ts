import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { AuthService } from 'app/core/auth/auth.service';
import { CartService } from 'app/core/cart/cart.service';
import { ErrorsService } from 'app/core/errors/errors.service';
import { BsModalService, BsModalRef } from 'ngx-bootstrap/modal';
import { PaymentDetailsPopupComponent } from 'app/modules/elements/payment-details-popup/payment-details-popup.component';
import { WalletService } from 'app/core/wallet/wallet.service';
import { WizardStage } from 'app/shared/wizard-dialog-service/wizard-stage.model';
import { WizardDialogService } from 'app/shared/wizard-dialog-service/wizard-dialog.service';
@Component({
  selector: 'app-cart',
  templateUrl: './cart.component.html',
  styleUrls: ['./cart.component.scss']
})
export class CartComponent implements OnInit {
  products = [];
  loggedIn: boolean;
  processingFee: number;
  isDisabled = true;
  etherToUsdExchangeRate = 1.87; // TODO: Get a service to calculate this in real-time
  total = 0;
  isAgree = false;
  public modalRef: BsModalRef;
  constructor(
    private cartService: CartService,
    private activatedRoute: ActivatedRoute,
    private router: Router,
    private authService: AuthService,
    private modalService: BsModalService,
    private errorsService: ErrorsService,
    private walletService: WalletService,
    private wizardService: WizardDialogService
  ) {}

  ngOnInit(): void {
    this.authService.check().subscribe((authenticated) => {
      this.loggedIn = authenticated;
    });
    this.products = this.cartService.getCartItems();
    this.processingFee = this.cartService.cardProcessingFee;
    //eslint-disable-next-line @typescript-eslint/naming-convention
    this.cartService.getEthPriceInUsd().subscribe((data) => {
      //eslint-disable-next-line @typescript-eslint/naming-convention
      this.etherToUsdExchangeRate = 1 / data.ETH.USD;
    });

    this.computeTotal();
    console.log(this.total);
  }

  removeProductFromCart(id: string): void {
    this.cartService.removeCartItem(id);
    this.products = this.cartService.getCartItems();
    this.computeTotal();
  }

  getProductsSum(): number {
    return this.cartService.getItemsSum();
  }

  checkOut(): void {
    if (this.loggedIn) {
      if (this.products && this.products.length > 0) {
        this.modalRef = this.modalService.show(PaymentDetailsPopupComponent, {
          class: 'mcl-payment-modal'
        });

        // this.products = [];
      } else {
        this.errorsService.openSnackBar('Cart Is Empty!', 'Error');
      }

      /* this.cartService.placeOrder(walletAddress).subscribe(
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
      const redirectURL = this.activatedRoute.snapshot.queryParamMap.get('redirectURL') || '/sign-in';
      // Navigate to the redirect url
      this.router.navigateByUrl(redirectURL);
    }
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

                        this.router.navigateByUrl('/order-success');
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

  addQuantity(index: number) {
    this.products[index].count++;
    this.products[index].price = this.products[index].price + this.products[index].subTotal;
    this.computeTotal();
  }

  reduceQuantity(index: number) {
    if (this.products[index].count > 0) {
      this.products[index].count--;
      this.products[index].price = this.products[index].price - this.products[index].subTotal;
      this.computeTotal();
    }
  }

  computeTotal() {
    console.log('hereeeee');
    const cartTotal = this.getProductsSum();
    // check if cart total is empty
    // if (this.getProductsSum() === 0) {
    //   return;
    // }
    this.total = parseFloat((this.getProductsSum() + this.processingFee).toFixed(5));
    console.log('total', this.total);
  }

  termsCheck() {
    this.isAgree = !this.isAgree;
    console.log(this.isAgree);
  }
}
