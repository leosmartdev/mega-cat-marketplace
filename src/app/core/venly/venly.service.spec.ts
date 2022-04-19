import { HttpClient } from '@angular/common/http';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { of } from 'rxjs';
import { ErrorsService } from '../errors/errors.service';
import { FulfillmentOfferCreatedResponseModel, OfferCreatedResponseModel } from '../models/offer-created-response.model';
import { PaymentService } from '../payment/payment.service';
import { WalletService } from '../wallet/wallet.service';
import {
  fulfillmentOfferCreatedResponseModelMocked,
  fulfillmentOfferTransactionMocked,
  offercreatedModelMocked,
  transactionMocked,
  updateOfferSignatureMocked
} from './spec-files/mocked';
import { environment } from 'environments/environment';
import { VenlyService } from './venly.service';
import { UpdateOfferSignatureResponseModel } from '../models/update-offer-signature-response.model';
import { mockedNftMetadata } from 'app/modules/landing/nft-details/spec-files/mocked';
import { mockedNft, mockedOfferResponse } from '../auction/spec-files/mocked';

const baseUrl = environment.apiUrl;

describe('VenlyService', () => {
  let service: VenlyService;
  let httpClient: HttpClient;
  let httpTestingController: HttpTestingController;

  const walletServiceMock = jasmine.createSpyObj('WalletService', ['']);
  const paymentServiceMock = jasmine.createSpyObj('PaymentService', ['']);
  const errorsServiceMock = jasmine.createSpyObj('ErrorsService', ['']);

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [
        HttpClient,
        VenlyService,
        { provide: PaymentService, useValue: paymentServiceMock },
        { provide: WalletService, useValue: walletServiceMock },
        { provide: ErrorsService, useValue: errorsServiceMock }
      ]
    });
    service = TestBed.inject(VenlyService);
    httpClient = TestBed.inject(HttpClient);
    httpTestingController = TestBed.inject(HttpTestingController);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should update offers with approval', async () => {
    const data = fulfillmentOfferCreatedResponseModelMocked;
    const expectedResponse: FulfillmentOfferCreatedResponseModel = {
      offerId: offercreatedModelMocked.offerId,
      transaction: data.transaction
    };
    const spyApprove = spyOn(service, 'approve').and.resolveTo(expectedResponse);
    const nftContractAddress = '0x029384';
    const response = await service.updateOfferWithApproval(nftContractAddress, data);

    expect(response).toEqual(expectedResponse);
    expect(spyApprove).toHaveBeenCalledTimes(1);
  });

  it('should update offer with signature', async () => {
    const spySignature = spyOn(service, 'signData').and.resolveTo(updateOfferSignatureMocked);
    const spyOfferDetails = spyOn<any>(service, 'getOfferDetails').and.returnValue(
      of({
        data: {
          id: updateOfferSignatureMocked.data.result.id,
          dataToSign: updateOfferSignatureMocked.data.dataToSign
        }
      })
    );

    const response = await service.updateOfferWithSignature(offercreatedModelMocked.offerId);

    expect(response).toEqual(updateOfferSignatureMocked);
  });

  it('should add signature to an offer', () => {
    const url = `${baseUrl}/product/offerSignature/`;
    const data = offercreatedModelMocked;
    const expectedResponse: UpdateOfferSignatureResponseModel = updateOfferSignatureMocked;
    service.addSignature(data).subscribe((res) => {
      expect(res).toEqual(expectedResponse);
    });

    const requestWrapper = httpTestingController.expectOne({ url });
    expect(requestWrapper.request.method).toEqual('POST');
    requestWrapper.flush(expectedResponse);
    httpTestingController.verify();
  });

  it('should fetch Nft Metadata', () => {
    const expectedResponse = mockedNftMetadata;
    const contractAddress = mockedNftMetadata.contract.address;
    const tokenId = mockedNft.tokenId;
    const url = `${baseUrl}/product/nft/${contractAddress}/${tokenId}`;

    service.fetchNftMetadata(contractAddress, tokenId).subscribe((res) => {
      expect(res).toEqual(expectedResponse);
    });

    const requestWrapper = httpTestingController.expectOne({ url });
    expect(requestWrapper.request.method).toEqual('GET');
    requestWrapper.flush(expectedResponse);
    httpTestingController.verify();
  });

  it('should get offer details by offerId', () => {
    const offerId = offercreatedModelMocked.offerId;
    const expectedResponse = mockedOfferResponse;
    const url = `${baseUrl}/product/offer/${offerId}`;

    (service as any).getOfferDetails(offerId).subscribe((res) => {
      expect(res).toEqual(expectedResponse);
    });

    const requestWrapper = httpTestingController.expectOne({ url });
    expect(requestWrapper.request.method).toEqual('GET');
    requestWrapper.flush(expectedResponse);
    httpTestingController.verify();
  });

  it('should make a reeuest to approve transacion', () => {
    const data = offercreatedModelMocked;
    const signData = updateOfferSignatureMocked;
    const url = `${baseUrl}/product/offerTxApprove/`;
    const expectedResponse: OfferCreatedResponseModel = {
      offerId: offercreatedModelMocked.offerId,
      transaction: [{ ...transactionMocked, type: 'approved' }]
    };

    service.approveTransaction(data).subscribe((res) => {
      expect(res).toEqual(expectedResponse);
    });

    const requestWrapper = httpTestingController.expectOne({ url });
    expect(requestWrapper.request.method).toEqual('POST');
    requestWrapper.flush(expectedResponse);
    httpTestingController.verify();
  });

  // it('should sign the data of a created offer', async () => {
  //   const data = offercreatedModelMocked;
  //   const offerId = offercreatedModelMocked.offerId;
  //   const expectedResponse = updateOfferSignatureMocked;
  //   service.window = {
  //     web3: {
  //       eth: {
  //         personal: {
  //           sign: (offerData, currentAccount) =>
  //             new Promise((resolve) => {
  //               resolve(updateOfferSignatureMocked.data.dataToSign);
  //             })
  //         }
  //       }
  //     }
  //   };

  //   const spySignature = spyOn<any>(service, 'addSignature').and.returnValue(of(expectedResponse));

  //   const response = await service.signData(data, (service as any).addSignature, offerId);

  //   expect(response).toEqual(expectedResponse);
  // });
});
