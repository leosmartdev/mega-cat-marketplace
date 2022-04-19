import { HttpClientModule } from '@angular/common/http';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { of } from 'rxjs';

import { AuthService } from '../auth/auth.service';
import { AuctionService } from './auction.service';
import { environment } from 'environments/environment';
import { AuctionPayload, AuctionResponse, AuctionStates } from './auction';
import { mockedOfferResponse, mockedNftAuctionResponse } from './spec-files/mocked';

const baseUrl = environment.apiUrl;

describe('AuctionService', () => {
  let service: AuctionService;
  let httpTestingController: HttpTestingController;
  const authServiceMock = jasmine.createSpyObj('AuthService', ['check', 'getAuthHeader']);
  authServiceMock.check.and.returnValue(of(true));

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientModule, HttpClientTestingModule],
      providers: [{ provide: AuctionService }, { provide: AuthService, useValue: authServiceMock }]
    });
    service = TestBed.inject(AuctionService);
    httpTestingController = TestBed.inject(HttpTestingController);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  describe('Create Auction', () => {
    it('should throw an error when offer id is not present', () => {
      const mockAuction: AuctionPayload = {
        offerId: null,
        expirationTime: 123,
        startingBid: 100
      };
      expect(() => service.create(mockAuction)).toThrowError('Auction offerId is not present');
    });

    it('should throw an error when expiration time is not present', () => {
      const mockAuction: AuctionPayload = {
        offerId: '123',
        expirationTime: null,
        startingBid: 100
      };
      expect(() => service.create(mockAuction)).toThrowError('Auction expirationTime is not present');
    });

    it('should throw an error when Starting Bid is not present', () => {
      const mockAuction: AuctionPayload = {
        offerId: '321',
        expirationTime: 123,
        startingBid: null
      };
      expect(() => service.create(mockAuction)).toThrowError('Auction startingBid is not present');
    });

    it('should create auction successfully', () => {
      const url = `${baseUrl}/auctions`;
      const mockAuction: AuctionPayload = {
        offerId: '321',
        expirationTime: 123,
        startingBid: 100
      };
      const expectedResponse: AuctionResponse = {
        id: 123,
        bids: [],
        ownerId: {
          name: 'Full Name',
          username: 'username'
        },
        status: AuctionStates.AWAITING,
        expirationTime: mockAuction.expirationTime,
        startingBid: mockAuction.startingBid
      };

      service.create(mockAuction).subscribe((res) => {
        expect(res).toEqual(expectedResponse);
      });

      const requestWrapper = httpTestingController.expectOne({ url });
      expect(requestWrapper.request.method).toEqual('POST');
      requestWrapper.flush(expectedResponse);
      httpTestingController.verify();
    });
  });

  it('should get the on going auctions', () => {
    const url = `${baseUrl}/auctions`;
    const expectedResponse = {
      data: [mockedOfferResponse]
    };

    service.getOnGoingAuctions().subscribe((res) => {
      expect(res).toEqual(expectedResponse);
    });

    const requestWrapper = httpTestingController.expectOne({ url });
    expect(requestWrapper.request.method).toEqual('GET');
    requestWrapper.flush(expectedResponse);
    httpTestingController.verify();
  });

  it('should get auctions created by user', () => {
    const url = `${baseUrl}/auctions/user`;
    const expectedResponse = {
      data: [mockedOfferResponse]
    };

    service.getAllCreatedByUser().subscribe((res) => {
      expect(res).toEqual(expectedResponse);
    });

    const requestWrapper = httpTestingController.expectOne({ url });
    expect(requestWrapper.request.method).toEqual('GET');
    requestWrapper.flush(expectedResponse);
    httpTestingController.verify();
  });

  it('should get auctions created by user', () => {
    const url = `${baseUrl}/auctions/participated`;
    const expectedResponse = {
      data: [mockedOfferResponse]
    };

    service.getAllParticipatedByUser().subscribe((res) => {
      expect(res).toEqual(expectedResponse);
    });

    const requestWrapper = httpTestingController.expectOne({ url });
    expect(requestWrapper.request.method).toEqual('GET');
    requestWrapper.flush(expectedResponse);
    httpTestingController.verify();
  });

  describe('getOne', () => {
    it('should get single auction', () => {
      const url = `${baseUrl}/auctions/5`;

      service.getOne('5').subscribe((res) => {
        expect(res.auction).toEqual(mockedNftAuctionResponse.auction);
      });

      const requestWrapper = httpTestingController.expectOne({ url });
      expect(requestWrapper.request.method).toEqual('GET');
      requestWrapper.flush(mockedNftAuctionResponse);
      httpTestingController.verify();
    });

    it('should throw an error when auction id is not present', () => {
      expect(() => service.getOne(null)).toThrowError('Auction id is not present');
    });
  });

  describe('addBid', () => {
    it('should create a bid on auction', () => {
      const url = `${baseUrl}/auctions/5/bid`;
      const mockAuction: AuctionPayload = {
        offerId: '321',
        expirationTime: 123,
        startingBid: 100
      };
      const expectedResponse: AuctionResponse = {
        id: 123,
        bids: [],
        ownerId: {
          name: 'Full Name',
          username: 'username'
        },
        status: AuctionStates.AWAITING,
        expirationTime: mockAuction.expirationTime,
        startingBid: mockAuction.startingBid
      };

      service.addBid(100, '5', false).subscribe((res) => {
        expect(res).toEqual(expectedResponse);
      });

      const requestWrapper = httpTestingController.expectOne({ url });
      expect(requestWrapper.request.method).toEqual('POST');
      requestWrapper.flush(expectedResponse);
      httpTestingController.verify();
    });

    it('should throw an error when auction id is not present', () => {
      const url = `${baseUrl}/auctions/5`;
      expect(() => service.addBid(100, null, false)).toThrowError('Auction id is not present');
    });

    it('should throw an error when bid amount is not present', () => {
      expect(() => service.addBid(null, '5', false)).toThrowError('Bid amount is not present');
    });
  });
});
