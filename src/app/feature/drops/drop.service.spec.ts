import { HttpClient } from '@angular/common/http';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { fakeAsync, flush, TestBed } from '@angular/core/testing';
import { AuthService } from 'app/core/auth/auth.service';
import { environment } from 'environments/environment';
import { Observer } from 'firebase/messaging';
import { from, Observable, of } from 'rxjs';
import { PaymentService } from 'app/core/payment/payment.service';
import { DropService } from './drop.service';
import { mockedNftDrop } from './spec-files/mocked';

const baseUrl = environment.apiUrl;

describe('DropService', () => {
  let service: DropService;
  let httpTestingController: HttpTestingController;

  const authServiceMock = jasmine.createSpyObj('AuthService', ['getAuthHeader']);
  authServiceMock.getAuthHeader.and.returnValue(from(['Test Auth Headers']));
  const paymentServiceMock = jasmine.createSpyObj('PaymentService', ['requestEtherPayment']);
  paymentServiceMock.requestEtherPayment.and.returnValue(true);

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [{ provide: HttpClient }, { provide: AuthService, useValue: authServiceMock }, { provide: PaymentService, useValue: paymentServiceMock }]
    });
    service = TestBed.inject(DropService);
    httpTestingController = TestBed.get(HttpTestingController);
    service.kill = false;
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should create a nft drop sucessfully', () => {
    const url = `${baseUrl}/drops/create`;
    const expectedResponse = { message: 'Drop created sucessfully!', data: mockedNftDrop };

    service.createDrop(new FormData()).subscribe((res) => {
      expect(res).toEqual(expectedResponse);
    });

    const requestWrapper = httpTestingController.expectOne({ url });
    expect(requestWrapper.request.method).toEqual('POST');
    requestWrapper.flush(expectedResponse);
    httpTestingController.verify();
  });

  it('should successfully mint a nft drop', () => {
    const url = `${baseUrl}/drops/mint`;
    const expectedResponse = { message: 'Drop minted sucessfully!', data: mockedNftDrop };
    const txHash = 'some transaction hash';
    service.mintDrop(txHash, mockedNftDrop.currentMint, 'test user', mockedNftDrop._id, mockedNftDrop.smartContractAddress, 'test network').subscribe((res) => {
      expect(res).toEqual(expectedResponse);
    });

    const requestWrapper = httpTestingController.expectOne({ url });
    expect(requestWrapper.request.method).toEqual('POST');
    requestWrapper.flush(expectedResponse);
    httpTestingController.verify();
  });

  it('should respond with an array of drops', fakeAsync(() => {
    service.dropsPoller = null;
    const expectedResponse = { message: 'Drops recieved sucessfully!', data: [mockedNftDrop] };
    spyOn(service, 'helper').and.callThrough();
    spyOn(service, 'fetchDrops').and.returnValue(of(expectedResponse));
    setTimeout(() => {
      service.kill = true;
    }, 3000);

    service.pollDrops().subscribe((res) => {
      expect(res).toEqual(expectedResponse);
    });
    flush();

    expect(service.kill).toEqual(true);
    expect(service.helper).toHaveBeenCalled();
  }));

  it('should set kill to true', () => {
    service.killPoll();

    expect(service.kill).toEqual(true);
  });

  it('should fetch a list of drops', () => {
    const url = `${baseUrl}/drops`;
    const expectedResponse = { message: 'Fetched drops sucessfully!', data: [mockedNftDrop] };

    service.fetchDrops().subscribe((res) => {
      expect(res).toEqual(expectedResponse);
    });

    const requestWrapper = httpTestingController.expectOne({ url });
    expect(requestWrapper.request.method).toEqual('GET');
    requestWrapper.flush(expectedResponse);
    httpTestingController.verify();
  });

  it('should fetch a single drop', () => {
    const dropId = 5;
    const url = `${baseUrl}/drops/${dropId}`;
    const expectedResponse = { message: 'Fetched drop sucessfully!', data: mockedNftDrop };

    service.fetchDrop(dropId).subscribe((res) => {
      expect(res).toEqual(expectedResponse);
    });

    const requestWrapper = httpTestingController.expectOne({ url });
    expect(requestWrapper.request.method).toEqual('GET');
    requestWrapper.flush(expectedResponse);
    httpTestingController.verify();
  });

  it('should return if kill is true', () => {
    const spyLog = spyOn(console, 'log');
    service.kill = true;
    let observer: Observer<any>;

    service.helper(observer, 1250);

    expect(spyLog).toHaveBeenCalledWith('Killing Drop poll');
  });

  it('should fetch the white list', () => {
    const googleSheetId = 'testId';
    const expectedResponse = {
      whiltelist: [],
      googleSheet: {
        id: googleSheetId
      }
    };
    const url = `${baseUrl}/sheets/whitelist/${googleSheetId}`;

    service.fetchWhitelist(googleSheetId).subscribe((res) => {
      expect(res).toEqual(expectedResponse);
    });

    const requestWrapper = httpTestingController.expectOne({ url });
    expect(requestWrapper.request.method).toEqual('GET');
    requestWrapper.flush(expectedResponse);
    httpTestingController.verify();
  });

  it('should get the per unit gas price', () => {
    const url = `${baseUrl}/drops/etherscan/oracle`;
    const expectedResponse = {
      price: 200
    };

    service.calculateGasPricePerUnit().subscribe((res) => {
      expect(res).toEqual(expectedResponse);
    });

    const requestWrapper = httpTestingController.expectOne({ url });
    expect(requestWrapper.request.method).toEqual('GET');
    requestWrapper.flush(expectedResponse);
    httpTestingController.verify();
  });

  it('should return gas price for mint transaction', () => {
    const response = service.getGasCostForMintTransaction();

    expect(response).toEqual(52_000);
  });

  it('should poll gas oracle', fakeAsync(() => {
    service.kill = false;
    const spyGasOracle = spyOn(service, 'gasOraclePollerHelper').and.callThrough();
    const expectedResponse = { message: 'Drops recieved sucessfully!', data: [mockedNftDrop] };
    spyOn(service, 'calculateGasPricePerUnit').and.returnValue(of(expectedResponse));
    service.gasOraclePoller = null;

    setTimeout(() => {
      service.kill = true;
    }, 3000);

    service.pollGasOracle().subscribe((res) => {
      expect(res).toEqual(expectedResponse);
    });
    flush();

    expect(spyGasOracle).toHaveBeenCalled();
    expect(service.kill).toBe(true);
  }));

  it('should request ether payment', () => {
    const ether = 100;
    const destination = 'testAddress';
    const confirmations = 1;
    const onSucess = () => {};
    const onError = () => {};

    service.requestEtherPayment(ether, destination, confirmations, onSucess, onError);

    expect(paymentServiceMock.requestEtherPayment).toHaveBeenCalledOnceWith(ether, destination, confirmations, onSucess, onError);
  });
});
