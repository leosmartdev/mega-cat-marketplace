import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { CartItem } from './cartItem';
import Swal from 'sweetalert2/dist/sweetalert2.js';
import { environment } from 'environments/environment';
import { WalletService } from '../wallet/wallet.service';
import { OfferResponseModel } from '../models/offer-response.model';
import { AuthService } from '../auth/auth.service';

const baseUrl = environment.apiUrl;
@Injectable()
export class CartService {
  cartItems: Array<CartItem>;
  orderItemStatuses: any[];
  cardProcessingFee: number = 0.0005;
  private paymentProcessingStatus: string;

  constructor(private _httpClient: HttpClient, private walletService: WalletService, private authService: AuthService) {
    this.cartItems = JSON.parse(localStorage.getItem('cart')) ?? [];
  }

  getPaymentStatus = () => this.paymentProcessingStatus;

  setPaymentStatus(status: string) {
    this.paymentProcessingStatus = status;
  }

  /**
   * Get Cart items count
   */
  getItemsCount = (): number => this.cartItems.length;

  /**
   * Get Cart items sum
   */
  getItemsSum = (): number => this.cartItems.reduce((prev, cur) => prev + cur.subTotal, 0);

  setCompletedOrder(orderItemStatuses: OfferResponseModel[]) {
    this.orderItemStatuses = orderItemStatuses;
  }

  getCompletedOrder = (): OfferResponseModel[] => this.orderItemStatuses;

  /**
   * Add Item to cart
   */
  addItemToCart(item: CartItem) {
    const check = this.cartItems.findIndex((cartItem) => cartItem._id === item._id);
    if (check !== -1) {
      Swal.fire({
        icon: 'info',
        title: '<p style="color:white;">Item Already In Cart!</p>',
        showConfirmButton: false,
        timer: 2000,
        background: '#5b5353',
        iconColor: 'white'
      });
    } else {
      this.cartItems = [];
      this.cartItems.push(item);
      Swal.fire({
        icon: 'success',
        title: '<p style="color:white;">Added To Cart Successfully!</p>',
        showConfirmButton: false,
        timer: 2000,
        background: '#5b5353',
        iconColor: 'white'
      });
    }
    localStorage.setItem('cart', JSON.stringify(this.cartItems));
  }

  /**
   * Get Cart Items
   */

  getCartItems(): Array<CartItem> {
    return JSON.parse(localStorage.getItem('cart'));
  }

  /**
   * Remove single item from cart
   */
  removeCartItem(id: string) {
    this.cartItems = this.cartItems.filter((obj) => obj._id !== id);
    localStorage.setItem('cart', JSON.stringify(this.cartItems));
  }

  /**
   * Place Order
   */
  placeOrder(): Observable<any> {
    const user = JSON.parse(localStorage.getItem('user') as string);

    const walletAddress = this.walletService.currentAccount;
    const data = new FormData();
    data.append('total', JSON.stringify(this.getItemsSum()));

    data.append('items', JSON.stringify(this.cartItems));
    data.append('walletAddress', walletAddress);
    data.append('userName', user.id);
    // this.cartItems = [];
    return this._httpClient.post(`${baseUrl}/order/create/`, data, { headers: this.authService.getAuthHeader() });
  }

  getPurchaseHistory(currentPage: string, pageSize: string): Observable<any> {
    return this._httpClient.get(`${baseUrl}/order/purchasehistory/${this.walletService.currentAccount}/${currentPage}/${pageSize}`, {
      headers: this.authService.getAuthHeader()
    });
  }

  getFilterPurchaseHistory(currentPage: string, pageSize: string, keyName: string, valueName: string): Observable<any> {
    return this._httpClient.get(`${baseUrl}/order/purchasehistory/filter/${keyName}/${valueName}/${this.walletService.currentAccount}/${currentPage}/${pageSize}`, {
      headers: this.authService.getAuthHeader()
    });
  }

  getAdminPurchaseHistory(currentPage: string, pageSize: string): Observable<any> {
    return this._httpClient.get(`${baseUrl}/order/purchasehistory/${currentPage}/${pageSize}`, {
      headers: this.authService.getAuthHeader()
    });
  }
  getFilterAdminPurchaseHistory(currentPage: string, pageSize: string, keyName: string, valueName: string): Observable<any> {
    return this._httpClient.get(`${baseUrl}/order/purchasehistory/filter/${keyName}/${valueName}/${currentPage}/${pageSize}`, {
      headers: this.authService.getAuthHeader()
    });
  }

  getSalesHistory(currentPage: string, pageSize: string): Observable<any> {
    return this._httpClient.get(`${baseUrl}/order/saleshistory/${this.walletService.currentAccount}/${currentPage}/${pageSize}`, {
      headers: this.authService.getAuthHeader()
    });
  }

  getFilterSalesHistory(currentPage: string, pageSize: string, keyName: string, valueName: string): Observable<any> {
    return this._httpClient.get(`${baseUrl}/order/saleshistory/filter/${keyName}/${valueName}/${this.walletService.currentAccount}/${currentPage}/${pageSize}`, {
      headers: this.authService.getAuthHeader()
    });
  }

  getEthPriceInUsd(): Observable<any> {
    const url = 'https://min-api.cryptocompare.com/data/pricemulti?fsyms=ETH,Matic&tsyms=USD&api_key=73d2826f96e11b3b5b7c1825c3de6b59e396eb726d5d434cfdc2f880cd4b373e';
    return this._httpClient.get(url);
  }
  generateBlockChainAddress(): Observable<any> {
    const token = 'QVBJX0tFWTo5MDBmNDIwZmVmNTUwMDAzY2ZiM2E0ZTlmZmQxMDkwNDpkZWRiZTI5NDE5MTNiMGY1ODAxNjc2NjJiOWVjNjBiMg';
    const merchantWalletID = '1000595218';
    const url = 'https://api-sandbox.circle.com/v1/wallets/' + merchantWalletID + '/addresses';
    const header = new HttpHeaders().set('Authorization', `Bearer ${token}`);
    const payload = {
      currency: 'ETH',
      chain: 'ETH',
      idempotencyKey: this.uuidv4()
    };
    /* const data = new FormData();
      data.append('currency', 'ETH');

      data.append('chain', "ETH");
      data.append('idempotencyKey', ); */

    // this.cartItems = [];
    return this._httpClient.post(url, payload, { headers: header });
  }

  /**
   * Get Cards
   **/
  getCards(): Observable<any> {
    return this._httpClient.get(`${baseUrl}/cards/index/`, {
      headers: this.authService.getAuthHeader()
    });
  }

  private uuidv4() {
    // @ts-ignore
    return ([1e7] + -1e3 + -4e3 + -8e3 + -1e11).replace(/[018]/g, (c) =>
      // eslint-disable-next-line no-bitwise
      (c ^ (crypto.getRandomValues(new Uint8Array(1))[0] & (15 >> (c / 4)))).toString(16)
    );
  }
}
