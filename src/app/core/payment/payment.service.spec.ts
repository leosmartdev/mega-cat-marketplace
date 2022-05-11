import { fakeAsync, flush, TestBed } from '@angular/core/testing';

import { PaymentService } from './payment.service';
import { CardDetails } from './card-details';
import { HttpErrorResponse } from '@angular/common/http';
import { CardPaymentResponse } from './card-payment-response';
import { BillingDetails } from './billing-details';
import { WalletService } from '../wallet/wallet.service';
import { AuthService } from '../auth/auth.service';
import { of, throwError } from 'rxjs';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { environment } from 'environments/environment';
import { mockedCardPaymentResponse, mockedPaymentCard } from './spec-files/mocked';
import { RSAPublicKey } from './rsa-public-key';

const baseUrl = environment.apiUrl;

describe('PaymentService', () => {
  let service: PaymentService;
  const billingDetails = new BillingDetails('123', 'Satoshi Nakamoto', 'Boston', 'US', '100 Money Street', 'Suite 1', 'MA', '01234', 10, 1, 2020);
  let httpTestingController: HttpTestingController;

  const defaultTimeout = 15000;
  const walletServiceMock = jasmine.createSpyObj('WalletService', ['sendEthereum', 'waitTransaction']);

  const authServiceMock = jasmine.createSpyObj('AuthService', ['accessToken', 'getAuthHeader', 'updateWalletAddresses', 'updateLinkedWalletAddresses']);
  const fakeRsaKey: RSAPublicKey = {
    keyId: 'S0M3ID',
    publicKey:
      // eslint-disable-next-line max-len
      'LS0tLS1CRUdJTiBQR1AgUFVCTElDIEtFWSBCTE9DSy0tLS0tCgptUUVOQkY0YzhWZ0JDQUM4QnN6WElCTytiZDZ4VnhLMUdlc3hLK2sybnlpamZ0NDdWa2xnbU80VmpTSmMzQS8yCkljeDNyWFR3S0ZIV282ckJBVUduSVhoK2ZYKzIwZGYwbld6WlNvN3ZNK0ZpMTMzVlpuTG0zalk4cVozdnR5WEMKenhqZnJ5UnlDSncrMlh6cnRGVklYT0RLSEd0RjhUSXZFNUdjdVMxclNmMGlsVUtzOWxUdXlOTEx1bXZJQ2RTeQpCMWQ3MUVCM3VDMUJpekRtaWplMHNFbjB0QXBGS3V0ZnB5aWtsbTZwWm9zWnVnYVUzL1Z3NWNkQTU5VlhHWnFpCjNTWGdzeHU1RE4zc21TU3ZVVkthMUtQd3hackZRZHQ2a3lOVUFuR0lRS3d4b3BjejAyY255R3JvZEdGU3c5TC8KbzlmeHo3Q3FpcnJvL3F6VjJzQmxFMkRvZWVLY09ZVTlzVHRCQUJFQkFBRzBCa05wY21Oc1pZa0JWQVFUQVFnQQpQaFloQlBTc3RXN3o4TkgrWVQ1MGE3S1dkbkdNTUlYQUJRSmVIUEZZQWhzREJRazRaQWtBQlFzSkNBY0NCaFVLCkNRZ0xBZ1FXQWdNQkFoNEJBaGVBQUFvSkVMS1dkbkdNTUlYQXhSQUgvM2xVL1hJbEkrZG5PR2pGRHJCTHMzcUYKN1grV0xsSU5YRmlaNWFuRC9ySnRUbGptb2R2dkhSSmlJTm1GcTRrNi90MURqcTJsdWpXTTFIUmJIaUtxTE56dQovWVJNNG5aL1lGUUd2YktqY3dNWHJDZ1Y1UFNESjZJdTE3MW4vdFFrYXFmRzd0M2ZXQzQzek10VFM4YnV6ZEtGCkQ1ai9yd0VkUjhhOXlsc0luWDdPZXlqekpUeENjQm1udmE1LzhZRFF4NFd4bk1WQWJ4ZnRRSjJzUXNJa0pNQ2MKV1d0TVZwZWlSSExlbWg1cnNhWnBnSkZ5cW1QODJXaDd0aGRkWHd3eVFGcHVUc2x6b1VKMmJaakZyMUxDSjBxRQp3MVJBOFVHaWhPUFB2SVprc2RvdFVDVDhoeXJPYU9GbUtDVUhhV0FQYzRDT3NzdVJpMU5VSGpJUVA0bVUyU0M1CkFRMEVYaHp4V0FFSUFMZFhXTUJaODlQZHFrSVRPWWZlL1pZZko4c2Nudk1PdlovQW1Vb3JpakM4M1VMdjVLbWsKSGpjVXJTR0pFYkpOdDl2NWVpc2RGOFRDNzVwZmhBLzZiOHZCUTVoMU0yT0FoUklYZGlJY1hLaTJyTXhINU9jWQo2YWFkWlVIRFIrYUZWRmtWdm53UnkxVFRDOFNleWs5UDRtd2lrTzl2RGlpMmU1SFl0R1pQcUVEWXVRN05pQnM2CktMRWpHclMwWFpieHg4WVk5enRRTUZKc2ZjdXRJd2lvTy9HcU1ZMFRKdkI0QnVJWTh2TjhPTnVubHZjb2JBYS8KcVRpYVFUcE93T3g2eElPbHB0TkFST1pncUNPZEk2R2NqMjRZRmcycEV4d0h0SjBXOFJpRDBpNEJJU0tEYkZEVAovWmlkMkptZW9vdG0vZXpaNUlDSUZNNk1wOEhDTjB6eWFSMEFFUUVBQVlrQlBBUVlBUWdBSmhZaEJQU3N0Vzd6CjhOSCtZVDUwYTdLV2RuR01NSVhBQlFKZUhQRllBaHNNQlFrNFpBa0FBQW9KRUxLV2RuR01NSVhBdmVJSC9BM1IKOTdlSENUOHdlOUFDUXkxcDJmNk41UFd6QWRaTUtQNm9QTXhpNFlCVUoyK1orNDVibnB2a0ZSdllMVjNwVFRIRApEY0N5cWh4Z0cxdEVGaVUyclZINlFzRStnWldYZkJPZU1lWHhqRkt0U0lzNktQUWViVlMrUHJhOHljK3RPakxOCkZsNlFCRjNGcGJ3YmE5L1pPbk1rbW9yTE1IV241RnJOVy9aZnVLdzhTMHFGQ29nUVNxUUVpbjZnQ0ZEd0gzK0QKQ2JzcDVKMm4xN1pncjBpcGRRYjk4MDJ1bXdDVG9aVGtwL0pwb2t4YzJTZlczaG0xUEc4M1NPUGdMUll0a3JuTApRbURYSmtDdEN6amN3eGQwdnJpVzM4Y29zQko1aVN4WHU5MEZHRWZaaGQ1Y0o4cFpKSkd2VGMrMyt6eE1sWU1HCnZmUjNvUFFoWmtwT2NyRUhlajA9Cj1BT0QzCi0tLS0tRU5EIFBHUCBQVUJMSUMgS0VZIEJMT0NLLS0tLS0K'
  };
  /*eslint-disable */
  authServiceMock.accessToken.and.returnValue(
    of(
      'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VyIjoiNjE4OTcwYjY3MDNkNzY2ZDFlNzMyNTg0IiwibmFtZSI6IlN0ZXZlIExpdmluZ3N0b24iLCJhdXRob3JpdHkiOiJ0aGlzIGlzIGEgdGVzdCBqd3QgZm9yIHN0YWdpbmciLCJpYXQiOjE1MTYyMzkwMjJ9.-vsMT_OMzcOrpXXeHaOQgH7HZuX4nG7XJr6PhG2NZzk'
    )
  );
  /*eslint-enable */
  walletServiceMock.sendEthereum.and.callThrough();

  beforeEach(() => {
    jasmine.DEFAULT_TIMEOUT_INTERVAL = defaultTimeout;
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

    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [
        {
          provide: WalletService,
          useValue: walletServiceMock
        },
        {
          provide: AuthService,
          useValue: authServiceMock
        }
      ]
    });
    service = TestBed.inject(PaymentService);
    httpTestingController = TestBed.get(HttpTestingController);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  describe('FetchRSAKey', () => {
    it('should fetch the rsa public 4key from Circle', async () => {
      const url = `${baseUrl}/payment/getPCIPublicKey`;
      const expectedResponse = {
        data: fakeRsaKey
      };

      service.getPCIPublicKey().subscribe((res) => {
        expect(res).toEqual(expectedResponse.data);
      });

      const requestWrapper = httpTestingController.expectOne({ url });
      expect(requestWrapper.request.method).toEqual('GET');
      requestWrapper.flush(expectedResponse);
      httpTestingController.verify();
    });

    it('should throw an error when failed to fetch the key', () => {
      const url = `${baseUrl}/payment/getPCIPublicKey`;
      const expectedResponse = { status: 404, statusText: 'Not found' };
      let errorResponse;

      service.getPCIPublicKey().subscribe(
        (res) => {},
        (error) => {
          errorResponse = error;
        }
      );

      const requestWrapper = httpTestingController.expectOne({ url });
      expect(requestWrapper.request.method).toEqual('GET');
      requestWrapper.flush({}, expectedResponse);
      expect(errorResponse.status).toEqual(404);
      expect(errorResponse.statusText).toEqual('Not found');
      httpTestingController.verify();
    });
  });

  describe('Card', () => {
    it('should save the card in localStorage', () => {
      const card = mockedPaymentCard;
      const spySet = spyOnProperty(service, 'card', 'set').and.callThrough();

      service.card = card;
      const savedCard = JSON.parse(localStorage.getItem('card'));

      expect(savedCard).toEqual(card);
      expect(spySet).toHaveBeenCalledTimes(1);
    });

    it('should get the card from localStorage', () => {
      const card = mockedPaymentCard;
      localStorage.setItem('card', JSON.stringify(card));
      const spyGet = spyOnProperty(service, 'card', 'get').and.callThrough();

      expect(service.card).toEqual(card);
      expect(spyGet).toHaveBeenCalledTimes(1);
    });
  });

  it('should properly encrypt a message', async () => {
    const cardNumber = '4007400000000007';
    const cvv = '123';
    const cardDetails = new CardDetails(cardNumber, cvv);
    spyOn(service, 'getPCIPublicKey').and.returnValue(of(fakeRsaKey));

    const encryptedValue = await service.encryptCardData(cardDetails);

    expect(encryptedValue).toBeTruthy();
  });

  describe('Create Card', () => {
    xit('should successfully create a card and get an id back', async () => {
      const url = `${baseUrl}/payment/createCard`;
      const cardNumber = '4007400000000007';
      const cvv = '123';
      // eslint-disable-next-line id-blacklist
      const cardDetails = { number: cardNumber, cvv };
      const expectedResponse = { data: { data: mockedCardPaymentResponse } };
      spyOn(service, 'encryptCardData').and.resolveTo({ keyId: fakeRsaKey.keyId, encryptedData: '' });
      const cardResponse = await service.createCard(cardDetails, billingDetails);

      expect(cardResponse).toEqual(mockedCardPaymentResponse);
    });

    it('should throw an error when bad data is passed to create card', async () => {
      const cardNumber = '';
      const cvv = '';
      spyOn(service, 'encryptCardData').and.rejectWith('Failed to encrypt!');
      const expectedException = new HttpErrorResponse({
        status: 500,
        statusText: 'Failed to encrypt card data.'
      });

      return await expectAsync(service.createCard(new CardDetails(cardNumber, cvv), billingDetails)).toBeRejectedWith(expectedException);
    });
  });

  describe('Request Ether Payment', async () => {
    it('should convert ether amount to wei before invoking sendEthereum', async () => {
      const etherPayment = 1.5;
      const mockTxResult = {
        tx: '0x098234lk2j34l2j3'
      };

      walletServiceMock.sendEthereum.and.returnValue(Promise.resolve(mockTxResult));

      const destination = '0xdestination';

      const promise = await service.requestEtherPayment(etherPayment, destination);

      expect(walletServiceMock.sendEthereum).toHaveBeenCalledWith(destination, etherPayment.toFixed(18));
      expect(promise).toEqual(mockTxResult);
    });
  });
});
