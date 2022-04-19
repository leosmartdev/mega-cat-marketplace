import { fakeAsync, flush, flushMicrotasks, TestBed } from '@angular/core/testing';
import { WalletService } from './wallet.service';
import { Router } from '@angular/router';
import { Observable, of, Subscriber } from 'rxjs';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { HttpClient } from '@angular/common/http';
import { AuthService } from '../auth/auth.service';
import { mock, trigger } from '@depay/web3-mock';
import Web3 from 'web3';

describe('WalletService', () => {
  let service: WalletService;
  let switchMock;
  let httpTestingController: HttpTestingController;
  const authServiceMock = jasmine.createSpyObj('AuthService', ['getCartItems', 'getItemsSum', 'check', 'updateWalletAddresses', 'updateLinkedWalletAddresses']);
  const ngZoneMock = jasmine.createSpyObj('NgZone', ['run']);
  ngZoneMock.run.and.returnValue(of(false));
  const routerMock = jasmine.createSpyObj('Router', ['navigate', 'navigateByUrl']);
  routerMock.navigate.and.returnValue(of(false));
  const blockchain = 'ethereum';
  const accounts = ['0xd8da6bf26964af9d7eed9e03e53415d37aa96045', '0xaAaB52F652eB9be0594b03479007272FDB87285C'];

  authServiceMock.updateWalletAddresses.and.returnValue(of({}));
  authServiceMock.updateLinkedWalletAddresses.and.returnValue(of({}));

  beforeEach(async () => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [{ provide: Router, useValue: routerMock }, { provide: HttpClient }, { provide: AuthService, useValue: authServiceMock }]
    });
    service = TestBed.inject(WalletService);
    httpTestingController = TestBed.get(HttpTestingController);
    mock({ blockchain, accounts: { return: accounts } });
    mock({
      blockchain,
      balance: {
        for: accounts[0],
        return: '100'
      }
    });
    mock({
      blockchain,
      transaction: {
        from: accounts[0],
        to: accounts[1],
        value: '200000000000000000000'
      }
    });
    switchMock = mock({
      blockchain: 'ethereum',
      network: {
        switchTo: '0x5'
      }
    });
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  describe('connectToMetaMask', () => {
    it('should navigate to collections if user is logged in', async () => {
      (service as any).accountObserver = {
        next: (account) => {}
      };
      const spyNavigate = routerMock.navigateByUrl.and.returnValue(Promise.resolve());
      const spyRequest = spyOn(service.window.ethereum, 'request').and.resolveTo({});
      authServiceMock.check.and.returnValue(of(true));

      await service.connectToMetaMask();

      expect(spyRequest).toHaveBeenCalled();
      expect(spyNavigate).toHaveBeenCalledWith('/collections');
    });

    it('should navigate to sign-in if user is not logged in', async () => {
      const spyNavigate = routerMock.navigateByUrl.and.returnValue(Promise.resolve());
      (service as any).accountObserver = {
        next: (account) => {}
      };
      const spyRequest = spyOn(service.window.ethereum, 'request').and.resolveTo({});
      authServiceMock.check.and.returnValue(of(false));

      await service.connectToMetaMask();

      expect(spyRequest).toHaveBeenCalled();
      expect(spyNavigate).toHaveBeenCalledWith('/sign-in');
    });

    it('should throw an error if user rejects the request', fakeAsync(() => {
      const spyRequest = spyOn(service.window.ethereum, 'request').and.rejectWith({
        code: 4001
      });

      service.connectToMetaMask();
      Promise.resolve();
      flushMicrotasks();

      expect(spyRequest).toHaveBeenCalled();
    }));

    it('should throw an error if request fails', fakeAsync(() => {
      const spyRequest = spyOn(service.window.ethereum, 'request').and.rejectWith('Error! something went Wrong');

      service.connectToMetaMask();
      Promise.resolve();
      flushMicrotasks();

      expect(spyRequest).toHaveBeenCalled();
    }));
  });

  describe('isWalletActive', () => {
    it('should return true', () => {
      spyOn(service, 'isMetaMaskInstalled').and.returnValue(true);
      service.currentAccount = {};

      expect(service.isWalletActive()).toBe(true);
    });

    it('should return false', () => {
      spyOn(service, 'isMetaMaskInstalled').and.returnValue(true);
      service.currentAccount = null;

      expect(service.isWalletActive()).toBe(false);
    });
  });

  describe('getChain', () => {
    it('should respond with -1 if metamask is not installed', () => {
      spyOn(service, 'isMetaMaskInstalled').and.returnValue(false);
      let response;

      service.getChainWatcher().subscribe((res) => {
        response = res;
      });

      expect(response).toEqual(-1);
    });

    it('should respond with chain id watcher', () => {
      spyOn(service, 'isMetaMaskInstalled').and.returnValue(true);
      service.chainIdWatcher = new Observable((subscriber) => {
        subscriber.next('Test watcher');
      });

      expect(service.getChainWatcher()).toEqual(service.chainIdWatcher);
    });
  });

  it('should respond with connected wallet account', () => {
    service.currentAccount = {
      id: 'test Account'
    };

    expect(service.getConnectedWallet()).toEqual(service.currentAccount);
  });

  it('should respond with an empty array if metamask is not installed', () => {
    spyOn(service, 'isMetaMaskInstalled').and.returnValue(false);
    let response;

    service.getAccounts().subscribe((res) => {
      response = res;
    });

    expect(response).toEqual([]);
  });

  it('should respond with accounts watcher', async () => {
    spyOn(service, 'isMetaMaskInstalled').and.returnValue(true);

    expect(service.getAccounts()).toEqual(service.accountWatcher);
  });

  describe('getBalance', () => {
    it('should respond with an error if failed to switch test net', async () => {
      const expectedException = { status: false, message: 'Failed to get balance.' };
      spyOn<any>(service, 'requireChain').and.resolveTo(expectedException);

      return await expectAsync(service.getBalance()).toBeRejectedWithError(expectedException.message);
    });

    it('should respond with the balance in the wallet', async () => {
      service.window.web3 = new Web3(service.window.ethereum);
      const expectedResponse = { status: 200 };
      service.currentAccount = accounts[0];
      spyOn<any>(service, 'requireChain').and.resolveTo(expectedResponse);
      spyOn<any>(service, 'convertETHtoUSD').and.resolveTo(100);

      const response = await service.getBalance();

      expect(response).toEqual(100);
    });
  });

  it('should log a statement if metamask is already installed', () => {
    const spyMetaMask = spyOn(service, 'isMetaMaskInstalled').and.returnValue(true);

    service.beginMetaMaskOnboarding();

    expect(spyMetaMask).toHaveBeenCalled();
  });

  it('should start onboarding if metamask is not installed already', () => {
    spyOn(service, 'isMetaMaskInstalled').and.returnValue(false);
    const spyOnBoarding = spyOn(service.metaMaskOnboarder, 'startOnboarding');
    service.beginMetaMaskOnboarding();

    expect(spyOnBoarding).toHaveBeenCalledTimes(1);
  });

  it('should log a statement if metamask is not installed', () => {
    const spyMetaMask = spyOn(service, 'isMetaMaskInstalled').and.returnValue(false);

    service.endMetaMaskOnboarding();

    expect(spyMetaMask).toHaveBeenCalled();
  });

  it('should stop onboarding if metamask is installed already', () => {
    spyOn(service, 'isMetaMaskInstalled').and.returnValue(true);
    const spyOnBoarding = spyOn(service.metaMaskOnboarder, 'stopOnboarding');
    service.endMetaMaskOnboarding();

    expect(spyOnBoarding).toHaveBeenCalledTimes(1);
  });

  describe('updateAccount', () => {
    it('should call purge cache if accounts array is empty', () => {
      const spyPurge = spyOn(service as any, 'purgeCache').and.callThrough();

      (service as any).updateAccount([]);

      expect(spyPurge).toHaveBeenCalledTimes(1);
      expect(service.currentAccount).toEqual(null);
    });

    it('should call update cache', () => {
      const spyUpdate = spyOn(service as any, 'updateCache');

      (service as any).updateAccount([{}]);

      expect(spyUpdate).toHaveBeenCalledTimes(1);
      expect(service.currentAccount).toEqual({});
    });
  });

  it('should return the chain name', () => {
    service.chainId = '1';

    expect(service.getChainName()).toEqual('ethereum');
  });

  it('should successfully send ethereum', () => {
    service.window.web3 = new Web3(service.window.ethereum);
    service.currentAccount = accounts[0];

    const response = service.sendEthereum(accounts[1], 200);

    expect(response).toBeTruthy();
  });

  it('should truncate the address', () => {
    const response = service.truncateAddress(accounts[0]);

    expect(response).toEqual('0xd8d ... 6045');
  });

  it('should get ethereum price in USD', () => {
    const expectedResponse = {
      status: 200,
      price: 100
    };
    const url = 'https://min-api.cryptocompare.com/data/pricemulti?fsyms=ETH,Matic&tsyms=USD&api_key=73d2826f96e11b3b5b7c1825c3de6b59e396eb726d5d434cfdc2f880cd4b373e';

    (service as any).getEthPriceInUsd().subscribe((res) => {
      expect(res).toEqual(expectedResponse);
    });

    const requestWrapper = httpTestingController.expectOne({ url });
    expect(requestWrapper.request.method).toEqual('GET');
    requestWrapper.flush(expectedResponse);
    httpTestingController.verify();
  });

  describe('SwitchTestNet', () => {
    it('should switch test net to GEORLI', async () => {
      service.window.web3 = new Web3(service.window.ethereum);
      const response = await service.requireChain('goerli');

      expect(response.status).toBe(true);
      expect(response.message).toEqual('Successfully changed!');
    });

    it('should switch test net to POLYGON', async () => {
      service.window.web3 = new Web3(service.window.ethereum);
      switchMock = mock({
        blockchain: 'ethereum',
        network: {
          switchTo: '0x13881'
        }
      });
      const response = await service.requireChain('mumbai');

      expect(response.status).toBe(true);
      expect(response.message).toEqual('Successfully changed!');
    });

    it('should give an error response if switching the network fails', async () => {
      switchMock = mock({
        blockchain: 'ethereum',
        network: {
          switchTo: '0x13881',
          error: () => ({ code: 4902, message: 'Failed to switch network!' })
        }
      });

      const response = await service.requireChain('mumbai');

      expect(response.status).toBe(false);
      expect(response.message).toEqual('Failed to switch network!');
    });
  });

  describe('isSuccessfulTransaction', () => {
    it('should return true', () => {
      const response = service.isSuccessfulTransaction({ status: 1 });

      expect(response).toBe(true);
    });

    it('should return false', () => {
      const response = service.isSuccessfulTransaction({ status: 0 });

      expect(response).toBe(false);
    });
  });

  it('should convert Ethereum to USD correctly', fakeAsync(() => {
    const url = 'https://min-api.cryptocompare.com/data/pricemulti?fsyms=ETH,Matic&tsyms=USD&api_key=73d2826f96e11b3b5b7c1825c3de6b59e396eb726d5d434cfdc2f880cd4b373e';
    const expectedResponse = { ETH: { USD: 10 } };

    (service as any).convertETHtoUSD(10).then((res) => {
      expect(res).toEqual(100);
    });

    const requestWrapper = httpTestingController.expectOne({ url });
    expect(requestWrapper.request.method).toEqual('GET');
    requestWrapper.flush(expectedResponse);
    httpTestingController.verify();
  }));

  it('should change the accounts on accounts change events', () => {
    const mockAccounts = ['0xb0252f13850a4823706607524de0b146820F2240', '0xEcA533Ef096f191A35DE76aa4580FA3A722724bE'];
    const spyUpdate = spyOn<any>(service, 'updateAccount');

    (service as any).setupAccountWatcher();

    expect(service.accountWatcher).toBeTruthy();
  });

  it('should change the chain on accounts change events', () => {
    const mockChain = '0x123';

    (service as any).setupChainIdWatcher();
    trigger('chainChanged', mockChain);

    expect(service.chainId).toEqual(mockChain);
  });

  it('should return the web3 object successfully', () => {
    const mockWeb3 = new Web3();
    service.window.web3 = mockWeb3;

    const response = service.getWeb3();

    expect(response).toEqual(mockWeb3);
  });
});
