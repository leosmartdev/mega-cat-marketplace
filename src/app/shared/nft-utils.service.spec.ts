import { fakeAsync, flush, TestBed } from '@angular/core/testing';
import { Offer } from 'app/core/models/offer.model';
import { VenlyWalletNft } from 'app/core/models/venly/venly-wallet-nft.model';
import { EtherscanAbiResponse, NftUtilsService } from './nft-utils.service';
import { mockedNftCard, mockedNftUtilsOffer, mockedvenlyWalletNft, mockedvenlyWalletNftResponse, mockUser } from 'app/core/auction/spec-files/mocked';
import { HttpClient } from '@angular/common/http';
import { WalletService } from 'app/core/wallet/wallet.service';
import { from } from 'rxjs';
import { SmartContractVerification } from 'app/core/models/smart-contract-verification.model';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { environment } from 'environments/environment';

const baseUrl = environment.bloxApiUrl;

describe('NftUtilsService', () => {
  let httpTestingController: HttpTestingController;
  let service: NftUtilsService;
  const walletServiceMock = jasmine.createSpyObj('WalletService', ['getChainId']);
  const fileReaderMock = jasmine.createSpyObj('FileReader', ['readAsDataURL', 'readAsBinaryString', 'onLoad', 'onError']);
  walletServiceMock.getChainId.and.returnValue(from([]));

  beforeEach(() => {
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
      providers: [{ provide: HttpClient }, { provide: WalletService, useValue: walletServiceMock }, { provide: FileReader, useValue: fileReaderMock }]
    });
    service = TestBed.inject(NftUtilsService);
    httpTestingController = TestBed.inject(HttpTestingController);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should return the fall back image sucessfully', () => {
    const expectedResponse = 'assets/images/mcl/no-cat.png';
    const res = service.getFallbackImage();

    expect(res).toEqual(expectedResponse);
  });

  it('should build nft card from venly offer', () => {
    const offer: Offer = mockedNftUtilsOffer;
    const expectedResponse = mockedNftCard;

    const res = service.buildNftCardFromVenlyOffer({ offer });
    expect(res).toEqual(expectedResponse);
  });

  it('should build nft card from venly offer with default image', () => {
    const offer: Offer = mockedNftUtilsOffer;
    offer.nft.imageUrl = null;
    const expectedResponse = mockedNftCard;
    expectedResponse.image = 'assets/images/mcl/cat.png';
    const spyDefaultImage = spyOn<any>(service, 'getDefaultImage').and.callThrough();

    const res = service.buildNftCardFromVenlyOffer({ offer });
    expect(res).toEqual(expectedResponse);
  });

  it('should build nft card from venly wallet', () => {
    const nft: VenlyWalletNft = mockedvenlyWalletNft;

    const expectedResponse = mockedvenlyWalletNftResponse;

    const res = service.buildNftCardFromVenlyWalletNft(nft);
    expect(res).toEqual(expectedResponse);
  });

  describe('Contract Status', () => {
    const CACHE_PREFIX = 'smartContractStatus';

    it('should store contract status in local storage', () => {
      walletServiceMock.getChainId.and.returnValue('1234');
      const mockedContractAddress = 'test_contract_address';
      const mockedContractKey = `${CACHE_PREFIX}_1234_${mockedContractAddress}`;
      const status = new SmartContractVerification(true, true, true, true, true);

      service.setContractStatus(mockedContractAddress, status);

      const response = service.getContractStatus(mockedContractAddress);

      expect(response).toEqual(response);
    });

    it('should update contract address sucessfully', () => {
      walletServiceMock.getChainId.and.returnValue('1234');
      const mockedContractAddress = 'test_contract_address';
      const mockedContractKey = `${CACHE_PREFIX}_1234_${mockedContractAddress}`;
      const status = new SmartContractVerification(true, true, true, true, true);
      localStorage.setItem(mockedContractKey, JSON.stringify(status));

      service.updateContractStatus(mockedContractAddress, 'hasMint', 'false');

      const response = service.getContractStatus(mockedContractAddress);

      expect(response.hasMint.toString()).toEqual('false');
    });
  });

  it('should get owner', () => {
    const expectedResponse = [mockUser];
    const contractAddress = 'testAddress';
    const network = 'test';
    const contractName = 'ChildMegaTokens';
    const url = `${baseUrl}/blockchain/contract/owner?network=${network}&contractAddress=${contractAddress}&contractName=${contractName}`;

    service.getOwner(contractAddress, network, contractName).subscribe((res) => {
      expect(res).toEqual(expectedResponse);
    });

    const requestWrapper = httpTestingController.expectOne({ url });
    expect(requestWrapper.request.method).toEqual('GET');
    requestWrapper.flush(expectedResponse);
    httpTestingController.verify();
  });

  it('should check the role of contract', () => {
    const expectedResponse = { hasRoele: true };
    const contractAddress = 'testAddress';
    const network = 'test';
    const contractName = 'ChildMegaTokens';
    const target = 'testTarget';
    const role = 'test';
    const url = `${baseUrl}/blockchain/contract/hasRole?network=${network}&contractAddress=${contractAddress}&contractName=${contractName}&role=${role}&target=${target}`;

    service.hasRole(contractAddress, network, target, role, contractName).subscribe((res) => {
      expect(res).toEqual(expectedResponse);
    });

    const requestWrapper = httpTestingController.expectOne({ url });
    expect(requestWrapper.request.method).toEqual('GET');
    requestWrapper.flush(expectedResponse);
    httpTestingController.verify();
  });

  it('should get verified contract Abi', () => {
    const expectedResponse: EtherscanAbiResponse = {
      status: 'success',
      message: 'Some Message',
      result: 'Test Result'
    };
    const polyscanApiKey = 'IZY9WP94S3XIWY21ZJFZXCETII7NQWAV5G';
    const expectedUrl = 'https://api-testnet.polygonscan.com';
    const contractAddress = 'testAddress';
    const url = `${expectedUrl}/api?module=contract&action=getabi&address=${contractAddress}&apikey=${polyscanApiKey}`;
    spyOn(service, 'getBaseUrlFromChain').and.returnValue(expectedUrl);

    service.getVerifiedContractAbi(contractAddress, '').subscribe((res) => {
      expect(res).toEqual(expectedResponse);
    });

    const requestWrapper = httpTestingController.expectOne({ url });
    expect(requestWrapper.request.method).toEqual('GET');
    requestWrapper.flush(expectedResponse);
    httpTestingController.verify();
  });

  it('should get local time date', () => {
    const response = service.getLocalDateTimeNow();

    expect(response).toBeTruthy();
  });

  it('should get count down configuration', () => {
    const dateTime = '2022-02-28';

    const response = service.getCountDownConfiguration(dateTime).formatDate({ date: new Date().getTime(), formatStr: 'hh:mm:ss' });

    console.log('config: ', response);

    expect(response).toBeTruthy();
  });

  it('should get time left from given date and time', () => {
    const dateTime = '2022-02-28';

    const response = service.getTimeLeftFromDateAsString(dateTime);

    expect(response).toBeTruthy();
  });

  it('should setup read as data url', fakeAsync(() => {
    const event = { target: { files: [new Blob(['test1.png', 'test2.png', 'test3.png'])], result: 'Test Result' } };
    const loader = {
      onLoad: (onLoadEvent) => {},
      onError: (onErrorEvent) => {}
    };
    const spyError = spyOn(loader, 'onError').and.callThrough();

    service.setupReadAsDataURL(event, loader.onLoad, loader.onError);
    flush();

    expect(spyError).not.toHaveBeenCalled();
  }));

  it('should setup read as binary string', fakeAsync(() => {
    const event = { target: { files: [new Blob(['test1.png', 'test2.png', 'test3.png'])], result: 'Test Result' } };
    const loader = {
      onLoad: (onLoadEvent) => {},
      onError: (onErrorEvent) => {}
    };
    const spyError = spyOn(loader, 'onError').and.callThrough();

    service.setupReadAsBinaryString(event, loader.onLoad, loader.onError);
    flush();

    expect(spyError).not.toHaveBeenCalled();
  }));

  describe('getBaseUrlFromChain', () => {
    it('should return default base url', () => {
      const expectedUrl = 'https://api-testnet.polygonscan.com';

      const response = service.getBaseUrlFromChain('');

      expect(response).toEqual(expectedUrl);
    });

    it('should return base url of mumbai chain', () => {
      const expectedUrl = 'https://api-testnet.polygonscan.com';

      const response = service.getBaseUrlFromChain('mumbai');

      expect(response).toEqual(expectedUrl);
    });

    it('should return base url of rinkeby chain', () => {
      const expectedUrl = 'https://api-rinkeby.etherscan.io';

      const response = service.getBaseUrlFromChain('rinkeby');

      expect(response).toEqual(expectedUrl);
    });

    it('should return base url of ethereum chain', () => {
      const expectedUrl = 'https://api.etherscan.io';

      const response = service.getBaseUrlFromChain('ethereum');

      expect(response).toEqual(expectedUrl);
    });

    it('should return base url of matic chain', () => {
      const expectedUrl = 'https://api.polygonscan.com';

      const response = service.getBaseUrlFromChain('matic');

      expect(response).toEqual(expectedUrl);
    });

    it('should return base url of polygon chain', () => {
      const expectedUrl = 'https://api.polygonscan.com';

      const response = service.getBaseUrlFromChain('polygon');

      expect(response).toEqual(expectedUrl);
    });
  });

  it('should return a promise in order to delay', async () => {
    const response = service.delay(50);

    return await expectAsync(response).toBeResolved();
  });
});
