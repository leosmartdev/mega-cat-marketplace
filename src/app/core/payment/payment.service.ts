import { WalletService } from './../wallet/wallet.service';
import { Injectable } from '@angular/core';
import * as openpgp from 'openpgp/lightweight';
import { CardDetails } from './card-details';
import { EncryptedValue } from './encrypted-value';
import { RSAPublicKey } from './rsa-public-key';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { CardPaymentResponse } from './card-payment-response';
import { BillingDetails } from './billing-details';
import { BillingResponse } from './billing-response';
import { environment } from 'environments/environment';
import { formatCurrency } from '@angular/common';
import { CartService } from '../cart/cart.service';
import { ErrorsService } from '../errors/errors.service';
import { AuthService } from '../auth/auth.service';
import { catchError, switchMap } from 'rxjs/operators';
import { Observable, of, throwError } from 'rxjs';
const baseUrl = environment.apiUrl;
@Injectable({
  providedIn: 'root'
})
export class PaymentService {
  /*eslint-disable */
  public static SANDBOX_CIRCLE_API_BASE_URI: string = 'https://api-sandbox.circle.com/v1';
  private static SANDBOX_BEARER_TOKEN = 'QVBJX0tFWTo5MDBmNDIwZmVmNTUwMDAzY2ZiM2E0ZTlmZmQxMDkwNDpkZWRiZTI5NDE5MTNiMGY1ODAxNjc2NjJiOWVjNjBiMg';

  private options = {
    method: 'POST',
    headers: {
      Accept: 'application/json',
      'Content-Type': 'application/json',
      Authorization: `Bearer ${this.authService.accessToken}`
    }
  };
  /*eslint-enable */

  constructor(private walletService: WalletService, private authService: AuthService, private httpClient: HttpClient) {}

  set card(newCard: any) {
    localStorage.setItem('card', JSON.stringify(newCard));
  }

  get card(): any {
    return JSON.parse(localStorage.getItem('card'));
  }

  async requestEtherPayment(ether: number, destination: string): Promise<any> {
    const etherInWei = ether.toFixed(18);
    return this.walletService.sendEthereum(destination, etherInWei);
  }

  public getPCIPublicKey(): Observable<RSAPublicKey> {
    const url = `${PaymentService.SANDBOX_CIRCLE_API_BASE_URI}/encryption/public`;
    return this.httpClient.get(`${baseUrl}/payment/getPCIPublicKey`, { headers: this.authService.getAuthHeader() }).pipe(
      switchMap((response: any) => of(response.data)),
      catchError((error) => throwError(error))
    );
  }

  public async encryptCardData(dataToEncrypt: CardDetails): Promise<EncryptedValue> {
    const rsaPublicKey = await this.getPCIPublicKey().toPromise();

    const decodedPublicKey = atob(rsaPublicKey.publicKey);

    const publicKey = await openpgp.readKey({ armoredKey: decodedPublicKey });

    const message = await openpgp.createMessage({ text: JSON.stringify(dataToEncrypt) });

    const encrypted = await openpgp.encrypt({
      message,
      encryptionKeys: publicKey
    });

    const encryptedValue: EncryptedValue = new EncryptedValue(btoa(encrypted), rsaPublicKey.keyId);

    return encryptedValue;
  }

  public uuidv4() {
    // @ts-ignore
    return ([1e7] + -1e3 + -4e3 + -8e3 + -1e11).replace(/[018]/g, (c) =>
      // eslint-disable-next-line no-bitwise
      (c ^ (crypto.getRandomValues(new Uint8Array(1))[0] & (15 >> (c / 4)))).toString(16)
    );
  }

  public async processPayment(billingDetails: BillingDetails, cardDetails: CardDetails, isSave: boolean): Promise<BillingResponse> {
    let card: CardPaymentResponse;
    try {
      card = await this.createCard(cardDetails, billingDetails);
      if (isSave) {
        const cardPayload = {
          cardId: card.id,
          cardNumber: cardDetails.number,
          expMonth: billingDetails.expMonth,
          expYear: billingDetails.expYear,
          name: billingDetails.name,
          city: billingDetails.city,
          country: billingDetails.country,
          line1: billingDetails.line1,
          line2: billingDetails.line2,
          district: billingDetails.district,
          postalCode: billingDetails.postalCode
        };
        const localCard = await this.httpClient
          .post(`${baseUrl}/cards/create`, { ...cardPayload }, { headers: this.authService.getAuthHeader() })
          .pipe(switchMap((res: Response) => of(res)))
          .toPromise();
        if (localCard.status === 400) {
          return new BillingResponse('failed', 'Payment failed due to unexpected error with registering card details.');
        }
      }
    } catch (error) {
      return new BillingResponse('failed', 'Payment failed due to unexpected error with registering card details.');
    }

    const metadata = {
      email: 'satoshi@circle.com',
      phoneNumber: '+14155555555',
      sessionId: 'xxx',
      ipAddress: '172.33.222.1'
    };

    // TODO: Fix amount issue. Circle has a lower limit of $0.50 USD.
    const amount = this.adjustAmount(billingDetails.amount);
    const amountMetdata = {
      amount: amount,
      currency: 'USD'
    };
    const source = {
      id: card.id,
      type: 'card'
    };
    const payload = {
      metadata: metadata,
      amount: amountMetdata,
      autoCapture: true,
      source: source,
      verification: 'none',
      description: 'Payment',
      idempotencyKey: this.uuidv4()
    };

    const url = `${PaymentService.SANDBOX_CIRCLE_API_BASE_URI}/payments`;

    let paymentResponse;
    try {
      paymentResponse = await this.httpClient
        .post(`${baseUrl}/payment/processPayment`, { ...payload }, { headers: this.authService.getAuthHeader() })
        .pipe(switchMap((res: Response) => of(res)))
        .toPromise();
    } catch (error) {
      return new BillingResponse('failed', 'Payment failed due to unexpected error' + error.message);
    }

    return new BillingResponse(paymentResponse.data.data.status, paymentResponse.data.data.description);
  }

  public async createCard(cardDetails: CardDetails, billingDetails: BillingDetails): Promise<CardPaymentResponse> {
    let encryptedCardDetails;
    try {
      encryptedCardDetails = await this.encryptCardData(cardDetails);
    } catch (error) {
      const message = 'Failed to encrypt card data.';

      throw new HttpErrorResponse({
        status: 500,
        statusText: message
      });
    }

    const billingDetailsPayload = {
      name: billingDetails.name,
      city: billingDetails.city,
      country: billingDetails.country,
      line1: billingDetails.line1,
      line2: billingDetails.line2,
      district: billingDetails.district,
      postalCode: billingDetails.postalCode
    };

    // TODO: Pull user metadata.
    const metadata = {
      email: 'satoshi@circle.com',
      phoneNumber: '+12025550180',
      sessionId: 'xxx',
      ipAddress: '172.33.222.1'
    };

    const payload = {
      idempotencyKey: this.uuidv4(),
      expMonth: billingDetails.expMonth,
      expYear: billingDetails.expYear,
      keyId: '',
      encryptedData: '',
      billingDetails: billingDetailsPayload,
      metadata: metadata
    };

    payload.keyId = encryptedCardDetails.keyId;
    payload.encryptedData = encryptedCardDetails.encryptedData;

    const url = `${PaymentService.SANDBOX_CIRCLE_API_BASE_URI}/cards`;
    let createCardResponse;
    try {
      createCardResponse = await this.httpClient
        .post(`${baseUrl}/payment/createCard`, { ...payload }, { headers: this.authService.getAuthHeader() })
        .pipe(switchMap((res: Response) => of(res)))
        .toPromise();
    } catch (error) {
      const message = 'Failed to create card';

      throw new HttpErrorResponse({
        status: 500,
        statusText: message
      });
    }

    return createCardResponse.data.data;
  }

  private adjustAmount(amount: number) {
    let updatedAmount = amount;
    if (amount < 0.5) {
      updatedAmount = 0.5;
    }
    updatedAmount = +updatedAmount.toFixed(2);

    return updatedAmount;
  }
}
