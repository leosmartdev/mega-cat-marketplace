import { HttpClientModule } from '@angular/common/http';
import { TestBed } from '@angular/core/testing';
import { CartService } from './cart.service';
import { Router } from '@angular/router';
import { WalletService } from '../wallet/wallet.service';
import { OfferResponseModel } from '../models/offer-response.model';
import { environment } from 'environments/environment';
import { of } from 'rxjs';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { Nft } from '../models/nft.model';
import { Offer } from '../models/offer.model';
import { orderItemStatusMocked } from './spec-files/mocked';
import { CartItem } from './cartItem';
import { AuthService } from '../auth/auth.service';

const baseUrl = environment.apiUrl;
const item: CartItem = {
  _id: '2323',
  name: 'mockName',
  tokenId: '#23',
  image: 'test.png',
  price: 20,
  count: 1,
  subTotal: 60,
  collection: '092384089',
  sellerAddress: '0x203498'
};

describe('CartService', () => {
  let service: CartService;
  let walletService: WalletService;
  let httpTestingController: HttpTestingController;

  beforeEach(() => {
    let store = {};

    const routerMock = jasmine.createSpyObj('Router', ['navigate']);
    const authServiceMock = jasmine.createSpyObj('AuthService', ['accessToken', 'getAuthHeader', 'updateWalletAddresses', 'updateLinkedWalletAddresses'], ['get']);
    authServiceMock.accessToken.and.callThrough();
    authServiceMock.updateWalletAddresses.and.returnValue(of(null));
    authServiceMock.updateLinkedWalletAddresses.and.returnValue(of(null));
    routerMock.navigate.and.returnValue(of(true));
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

    TestBed.configureTestingModule({
      imports: [HttpClientModule, HttpClientTestingModule],
      providers: [{ provide: CartService }, { provide: WalletService }, { provide: Router, useValue: routerMock }, { provide: AuthService, useValue: authServiceMock }]
    });

    service = TestBed.inject(CartService);
    walletService = TestBed.inject(WalletService);
    httpTestingController = TestBed.get(HttpTestingController);
  });

  it('should get payment status sucessfully', () => {
    service.setPaymentStatus('SOME_STATE_1');
    expect(service.getPaymentStatus()).toEqual('SOME_STATE_1');
  });

  it('should set the payment status correctly', () => {
    service.setPaymentStatus('SOME_STATE_2');
    expect(service.getPaymentStatus()).toEqual('SOME_STATE_2');
  });

  it('should get count of items in cart correctly', () => {
    service.cartItems.push(item);
    const res = service.getItemsCount();
    expect(res).toEqual(1);
  });

  it('should get items subtotal sum correctly', () => {
    service.cartItems.push(item);
    const res = service.getItemsSum();
    expect(res).toEqual(item.subTotal);
  });

  it('should set the completed order correctly', () => {
    const orderItemStatuses: OfferResponseModel[] = [];
    orderItemStatuses.push(orderItemStatusMocked);

    service.setCompletedOrder(orderItemStatuses);
    expect(service.orderItemStatuses).toEqual(orderItemStatuses);
  });

  it('should get the completed order correctly', () => {
    service.orderItemStatuses = [];
    service.orderItemStatuses.push(orderItemStatusMocked);
    const res = service.getCompletedOrder();
    expect(res[0]).toEqual(orderItemStatusMocked);
  });

  describe('addItemToCart', () => {
    it('should store the cart in localStorage', () => {
      service.addItemToCart(item);
      localStorage.setItem('cart', JSON.stringify(service.cartItems));
      expect(service.cartItems).toEqual(JSON.parse(localStorage.getItem('cart')));
    });

    it('should add an item to the cart', () => {
      service.addItemToCart(item);
      expect(item).toEqual(service.cartItems.find((cartItem) => cartItem._id === item._id));
    });
  });

  it('should display a message that an item already exists', () => {
    service.cartItems.push(item);
    service.addItemToCart(item);
    expect(service.cartItems.length).toEqual(1);
  });

  it('should remove the cart item', () => {
    service.cartItems.push(item);
    service.removeCartItem(item._id);
    expect(service.cartItems).toEqual(JSON.parse(localStorage.getItem('cart')));
  });

  it('should get all cart items', () => {
    const cartItems = service.getCartItems();
    expect(cartItems).toEqual(JSON.parse(localStorage.getItem('cart')));
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should place an order correctly', (done) => {
    localStorage.setItem('user', JSON.stringify({ id: '123' }));
    const url = `${baseUrl}/order/create/`;
    const expectedResponse = { order: {} };
    const spyItem = spyOn(service, 'getItemsSum');

    service.placeOrder().subscribe((res) => {
      expect(expectedResponse).toEqual(res);
      expect(spyItem).toHaveBeenCalled();
      done();
    });

    const requestWrapper = httpTestingController.expectOne({ url });
    expect(requestWrapper.request.method).toEqual('POST');
    requestWrapper.flush(expectedResponse);
    httpTestingController.verify();
  });

  it('should get ethereum price successfully', (done) => {
    const url = 'https://min-api.cryptocompare.com/data/pricemulti?fsyms=ETH,Matic&tsyms=USD&api_key=73d2826f96e11b3b5b7c1825c3de6b59e396eb726d5d434cfdc2f880cd4b373e';
    const expectedResponse = { price: '2233' };

    service.getEthPriceInUsd().subscribe((res) => {
      expect(res).toEqual(expectedResponse);
      done();
    });

    const requestWrapper = httpTestingController.expectOne({ url });
    expect(requestWrapper.request.method).toEqual('GET');
    requestWrapper.flush(expectedResponse);
    httpTestingController.verify();
  });

  it('should generate block chain adress sucessfully', (done) => {
    const id = '1000595218';
    const url = `https://api-sandbox.circle.com/v1/wallets/${id}/addresses`;
    const expectedResponse = { address: {} };

    service.generateBlockChainAddress().subscribe((res) => {
      expect(res).toEqual(expectedResponse);
      done();
    });

    const requestWrapper = httpTestingController.expectOne({ url });
    expect(requestWrapper.request.method).toEqual('POST');
    requestWrapper.flush(expectedResponse);
    httpTestingController.verify();
  });

  it('should get cards sucessfully', () => {
    const url = `${baseUrl}/cards/index/`;
    const expectedResponse = {
      data: []
    };

    service.getCards().subscribe((res) => {
      expect(res).toEqual(expectedResponse);
    });

    const requestWrapper = httpTestingController.expectOne({ url });
    expect(requestWrapper.request.method).toEqual('GET');
    requestWrapper.flush(expectedResponse);
    httpTestingController.verify();
  });
});
