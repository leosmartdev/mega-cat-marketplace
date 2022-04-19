import { HttpClient, HttpHandler } from '@angular/common/http';
import { NftUtilsService } from './../../../../shared/nft-utils.service';
import { NgZone } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ActivatedRoute } from '@angular/router';
import { AuthService } from 'app/core/auth/auth.service';
import { ErrorsService } from 'app/core/errors/errors.service';
import { ProductService } from 'app/core/product/product.service';
import { VenlyService } from 'app/core/venly/venly.service';
import { WalletService } from 'app/core/wallet/wallet.service';
import { from, Observable, of, throwError } from 'rxjs';

import { LandingComponent } from './landing.component';
import { mockedNftCard, mockedOfferResponse, mockedvenlyWalletNft } from 'app/core/auction/spec-files/mocked';
import { AuctionService } from 'app/core/auction/auction.service';
import { NftCardModel } from 'app/core/models/nft-card.model';

describe('LandingComponent', () => {
  const fakeActivatedRoute = {
    snapshot: { data: {} },
    data: new Observable((observer) => {
      observer.next({ isUserAuction: null, isParticipatedAuction: null });
    })
  } as ActivatedRoute;
  let component: LandingComponent;
  let fixture: ComponentFixture<LandingComponent>;

  const productServiceMock = jasmine.createSpyObj('ProductService', ['listingNFT', 'getAllListings']);
  const mockedOffer = mockedOfferResponse;
  mockedOffer.status = 'AWAITING_FINALIZING_OFFER';
  productServiceMock.getAllListings.and.returnValue(of({}));
  productServiceMock.listingNFT.and.returnValue(of({ data: [mockedOfferResponse] }));

  const nftUtilsServiceMock = jasmine.createSpyObj('NftUtilsService', ['buildNftCardFromVenlyWalletNft', 'buildNftCardFromVenlyOffer']);
  nftUtilsServiceMock.buildNftCardFromVenlyWalletNft.and.returnValue({});
  nftUtilsServiceMock.buildNftCardFromVenlyOffer.and.returnValue({});

  const walletServiceMock = jasmine.createSpyObj('WalletService', ['user', 'getAccounts']);
  walletServiceMock.user = 'someone';
  walletServiceMock.getAccounts.and.returnValue(of([]));
  const auctionServiceMock = jasmine.createSpyObj('AuctionService', ['getAllCreatedByUser', 'getAllParticipatedByUser']);
  auctionServiceMock.getAllCreatedByUser.and.returnValue(of({}));
  auctionServiceMock.getAllParticipatedByUser.and.returnValue(of({}));

  const authServiceMock = jasmine.createSpyObj('AuthService', ['user', 'updateWalletAddresses', 'updateLinkedWalletAddresses']);

  const errorsServiceMock = jasmine.createSpyObj('ErrorsService', ['openSnackBar']);

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [LandingComponent],
      providers: [
        { provide: ProductService, useValue: productServiceMock },
        { provide: NftUtilsService, useValue: nftUtilsServiceMock },
        {
          provide: ErrorsService,
          useValue: errorsServiceMock
        },
        { provide: WalletService, useValue: walletServiceMock },
        {
          provide: AuthService,
          useValue: authServiceMock
        },
        { provide: AuctionService, useValue: auctionServiceMock },
        { provide: ActivatedRoute, useValue: fakeActivatedRoute },
        { provide: HttpClient },
        { provide: HttpHandler }
      ]
    }).compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(LandingComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
    component.nfts = [];
  });

  afterEach(() => {
    fixture.destroy();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should create with participated auctions', () => {
    fixture.destroy();
    fakeActivatedRoute.data = new Observable((observer) => {
      observer.next({ isUserAuction: false, isParticipatedAuction: true });
    });
    fixture = TestBed.createComponent(LandingComponent);
    component = fixture.componentInstance;
    spyOn(component, 'getAuctionsParticipatedByUser');
    fixture.detectChanges();

    expect(component.getAuctionsParticipatedByUser).toHaveBeenCalled();
  });

  it('should create with user auctions', () => {
    fixture.destroy();
    fakeActivatedRoute.data = new Observable((observer) => {
      observer.next({ isUserAuction: true, isParticipatedAuction: false });
    });
    fixture = TestBed.createComponent(LandingComponent);
    component = fixture.componentInstance;
    spyOn(component, 'getAuctionsCreatedByUser');
    fixture.detectChanges();

    expect(component.getAuctionsCreatedByUser).toHaveBeenCalled();
  });

  it('should log an error and do not set nfts if request to get pending offers fails', () => {
    productServiceMock.getAllListings.and.returnValue(throwError('failed to get pending offers'));

    component.getPendingOffers();

    expect(component.nfts).toEqual([]);
  });

  it('should get all pending offers', () => {
    component.nfts = [];
    const mocked = JSON.parse(JSON.stringify(mockedOfferResponse));
    mocked.status = 'AWAITING_FINALIZING_OFFER';
    productServiceMock.getAllListings.and.returnValue(of({ data: [mocked] }));
    nftUtilsServiceMock.buildNftCardFromVenlyOffer.and.returnValue(mockedNftCard);

    component.getPendingOffers();

    expect(component.nfts).toEqual([{ nft: mockedNftCard }]);
  });

  describe('getNftsForWallet', () => {
    it('should get all offers owned by user', () => {
      component.nfts = [];
      component.filteredNFTs = [];
      productServiceMock.getAllListings.and.returnValue(of({ data: [mockedOffer] }));
      component.walletAddress = mockedOffer.sellerAddress;
      productServiceMock.listingNFT.and.returnValue(of({ data: [mockedvenlyWalletNft] }));
      nftUtilsServiceMock.buildNftCardFromVenlyWalletNft.and.returnValue(mockedNftCard as NftCardModel);
      nftUtilsServiceMock.buildNftCardFromVenlyOffer.and.returnValue(mockedNftCard as NftCardModel);

      component.getNFTsForWallet();

      expect(component.filteredNFTs).toEqual([{ nft: mockedNftCard }, { nft: mockedNftCard }]);
    });

    it('should store an empty array if no data is received', () => {
      productServiceMock.getAllListings.and.returnValue(of({ data: [mockedOffer] }));
      component.walletAddress = mockedOffer.sellerAddress;
      productServiceMock.listingNFT.and.returnValue(of({ data: undefined }));

      component.getNFTsForWallet();

      expect(component.filteredNFTs).toEqual([]);
      expect(component.nfts).toEqual([]);
    });

    it('should respond with a snackbar if failed to fetch listings', () => {
      productServiceMock.getAllListings.and.returnValue(of({ data: [mockedOffer] }));
      component.walletAddress = mockedOffer.sellerAddress;
      productServiceMock.listingNFT.and.returnValue(throwError('Something went wrong!'));

      component.getNFTsForWallet();

      expect(errorsServiceMock.openSnackBar).toHaveBeenCalledWith('Something went wrong!', 'Error');
    });
  });

  describe('setWalletAddress', () => {
    it('should set the wallet address to null if no account is received', () => {
      walletServiceMock.getAccounts.and.returnValue(of([]));

      component.setWalletAddress();

      expect(component.walletAddress).toEqual(null);
    });

    it('should set the wallet address to the first account address', () => {
      walletServiceMock.getAccounts.and.returnValue(of(['test address']));

      component.setWalletAddress();

      expect(component.walletAddress).toEqual('test address');
    });
  });

  it('should get and process auctions created by user', () => {
    component.filteredNFTs = [];
    auctionServiceMock.getAllCreatedByUser.and.returnValue(of({ data: [mockedOfferResponse] }));
    nftUtilsServiceMock.buildNftCardFromVenlyOffer.and.returnValue(mockedNftCard);

    component.getAuctionsCreatedByUser();

    expect(component.filteredNFTs).toEqual([{ nft: mockedNftCard, auction: mockedOfferResponse.auction }]);
  });

  it('should get and process auctions participated by user', () => {
    component.filteredNFTs = [];
    auctionServiceMock.getAllParticipatedByUser.and.returnValue(of({ data: [mockedOfferResponse] }));
    nftUtilsServiceMock.buildNftCardFromVenlyOffer.and.returnValue(mockedNftCard);

    component.getAuctionsParticipatedByUser();

    expect(component.filteredNFTs).toEqual([{ nft: mockedNftCard, auction: mockedOfferResponse.auction }]);
  });

  it('should toggle the search filter', () => {
    component.isSelecting = true;

    component.selectingFilter();

    expect(component.isSelecting).toEqual(false);
  });

  it('should search the nfts correctly', () => {
    const expectedResonse = [{ nft: mockedNftCard, auction: mockedOfferResponse.auction }];
    component.nfts = expectedResonse;
    component.term = 'test';

    component.search();

    expect(component.filteredNFTs).toEqual(expectedResonse);
  });

  describe('SelectFilter', () => {
    it('should select all listings from inventory', () => {
      component.selectFilter('Inventory');

      expect(component.selectedOption).toEqual('Inventory');
      expect(component.isSelecting).toEqual(false);
    });

    it('should select only users listings from inventory', () => {
      component.selectFilter('My Listings');

      expect(component.selectedOption).toEqual('My Listings');
      expect(component.isSelecting).toEqual(false);
    });

    it('should select users auctions from inventory', () => {
      component.selectFilter('My Auctions');

      expect(component.selectedOption).toEqual('My Auctions');
      expect(component.isSelecting).toEqual(false);
    });

    it('should select sold listings from inventory', () => {
      component.selectFilter('Sold');

      expect(component.selectedOption).toEqual('Sold');
      expect(component.isSelecting).toEqual(false);
    });

    it('should select listings purchased by user from inventory', () => {
      component.selectFilter('Bought');

      expect(component.selectedOption).toEqual('Bought');
      expect(component.isSelecting).toEqual(false);
    });

    it('should select all collections from inventory', () => {
      component.selectFilter('Collections');

      expect(component.selectedOption).toEqual('Collections');
      expect(component.isSelecting).toEqual(false);
    });
  });
});
