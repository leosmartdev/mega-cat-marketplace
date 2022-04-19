import { ComponentFixture, TestBed } from '@angular/core/testing';
import { from, of, throwError } from 'rxjs';
import { CollectionsComponent } from './collections.component';
import { ProductService } from 'app/core/product/product.service';
import { ErrorsService } from 'app/core/errors/errors.service';
import { CartService } from 'app/core/cart/cart.service';
import { Router } from '@angular/router';
import { AuctionService } from 'app/core/auction/auction.service';
import { NftUtilsService } from 'app/shared/nft-utils.service';
import { mockedNftAuctionResponse, mockedNftCard, mockedOfferResponse } from 'app/core/auction/spec-files/mocked';
import { Product } from 'app/core/product/product';
import { mockedProduct } from '../collection/spec-files/mocked';
import { NftCardModel } from 'app/core/models/nft-card.model';
import { AuctionResponse } from 'app/core/auction/auction';

describe('CollectionsComponent', () => {
  let component: CollectionsComponent;
  let fixture: ComponentFixture<CollectionsComponent>;
  enum ListingCategory {
    SALE = 'buy',
    AUCTION = 'auction'
  }
  interface NftAuctionModel {
    nft: NftCardModel;
    auction?: AuctionResponse;
  }

  const errorsServiceMock = jasmine.createSpyObj('ErrorService', ['openSnackBar']);
  const productServiceMock = jasmine.createSpyObj('ProductService', [
    'getSaleNFTs',
    'listForSale',
    'filterProducts',
    'searchProducts',
    'getAllListings',
    'getAllReadyListings',
    'getCollectionDetail'
  ]);
  const fakeProducts = [];
  const cartServiceMock = jasmine.createSpyObj('CartService', ['']);
  const routerMock = jasmine.createSpyObj('Router', ['']);
  productServiceMock.getSaleNFTs.and.returnValue(from(fakeProducts));
  productServiceMock.getAllListings.and.returnValue(from(fakeProducts));
  productServiceMock.getAllReadyListings.and.returnValue(from(fakeProducts));
  productServiceMock.listForSale.and.returnValue(from(fakeProducts));
  productServiceMock.filterProducts.and.returnValue(from(fakeProducts));
  productServiceMock.searchProducts.and.returnValue(from(fakeProducts));

  const auctionServiceMock = jasmine.createSpyObj('AuctionService', ['getOnGoingAuctions']);
  auctionServiceMock.getOnGoingAuctions.and.returnValue(from(fakeProducts));
  const authServiceMock = jasmine.createSpyObj('AuthService', ['accessToken'], ['get']);
  authServiceMock.accessToken.and.callThrough();
  const nftServiceMock = jasmine.createSpyObj('NftUtilsService', ['buildNftCardFromVenlyOffer']);

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [CollectionsComponent],
      providers: [
        { provide: ProductService, useValue: productServiceMock },
        { provide: AuctionService, useValue: auctionServiceMock },
        { provide: ErrorsService, useValue: errorsServiceMock },
        { provide: CartService, useValue: cartServiceMock },
        { provide: Router, useValue: routerMock },
        { provide: NftUtilsService, useValue: nftServiceMock }
      ]
    }).compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(CollectionsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  afterEach(() => {
    fixture.destroy();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  describe('GetListing', () => {
    it('should get all auction listings', () => {
      component.SaleType = ListingCategory.AUCTION;
      const spyProcess = spyOn<any>(component, 'processListingResponse');
      auctionServiceMock.getOnGoingAuctions.and.returnValue(of([mockedNftAuctionResponse]));

      component.getListing();

      expect(spyProcess).toHaveBeenCalled();
    });

    it('should respond with an error if auction response fails', () => {
      component.SaleType = ListingCategory.AUCTION;
      auctionServiceMock.getOnGoingAuctions.and.returnValue(throwError('Something went wrong!'));

      component.getListing();

      expect(auctionServiceMock.getOnGoingAuctions).toHaveBeenCalled();
      expect(errorsServiceMock.openSnackBar).toHaveBeenCalledWith('Something went wrong!', 'Error');
    });

    it('should respond with an error if get listings response fails', () => {
      component.SaleType = ListingCategory.SALE;
      productServiceMock.getAllReadyListings.and.returnValue(throwError('Something went wrong!'));

      component.getListing();

      expect(errorsServiceMock.openSnackBar).toHaveBeenCalledWith('Something went wrong!', 'Error');
    });
  });

  describe('processListingResponse', () => {
    it('should process the sale listing response', () => {
      nftServiceMock.buildNftCardFromVenlyOffer.and.returnValue(mockedNftCard);
      component.SaleType = ListingCategory.SALE;

      (component as any).processListingResponse({ data: [mockedOfferResponse] });

      expect(component.filteredNFt).toEqual([{ nft: mockedNftCard, auction: undefined }]);
    });

    it('should process the auction listing response', () => {
      nftServiceMock.buildNftCardFromVenlyOffer.and.returnValue(mockedNftCard);
      component.SaleType = ListingCategory.AUCTION;

      (component as any).processListingResponse({ data: [mockedOfferResponse] });

      expect(component.filteredNFt).toEqual([{ nft: mockedNftCard, auction: mockedOfferResponse.auction }]);
    });
  });

  describe('PriceFilter', () => {
    it('should filter all nfts with price less than 50', () => {
      const mockedNftCard2: NftCardModel = JSON.parse(JSON.stringify(mockedNftCard));
      const mockedNftCard3: NftCardModel = JSON.parse(JSON.stringify(mockedNftCard));
      mockedNftCard2.listing.price = 30;
      mockedNftCard3.listing.price = 70;
      const nftAuctionModel: NftAuctionModel = {
        nft: mockedNftCard,
        auction: undefined
      };
      const nftAuctionModel2: NftAuctionModel = {
        nft: mockedNftCard2,
        auction: undefined
      };
      const nftAuctionModel3: NftAuctionModel = {
        nft: mockedNftCard3,
        auction: undefined
      };
      component.saleNFTs = [mockedNftCard, mockedNftCard2, mockedNftCard3];
      component.pricefilterValue = 'Some';
      component.Collection = 'some';

      component.PriceFilter('Less Than 50', 'price');

      expect(component.filteredNFt).toEqual([nftAuctionModel, nftAuctionModel2]);
    });

    it('should filter all nfts with price in between 50 and 100', () => {
      const mockedNftCard2: NftCardModel = JSON.parse(JSON.stringify(mockedNftCard));
      const mockedNftCard3: NftCardModel = JSON.parse(JSON.stringify(mockedNftCard));
      mockedNftCard2.listing.price = 60;
      mockedNftCard3.listing.price = 80;
      const nftAuctionModel: NftAuctionModel = {
        nft: mockedNftCard,
        auction: undefined
      };
      const nftAuctionModel2: NftAuctionModel = {
        nft: mockedNftCard2,
        auction: undefined
      };
      const nftAuctionModel3: NftAuctionModel = {
        nft: mockedNftCard3,
        auction: undefined
      };
      component.saleNFTs = [mockedNftCard, mockedNftCard2, mockedNftCard3];
      component.pricefilterValue = 'Some';
      component.Collection = 'some';

      component.PriceFilter('50-100', 'price');

      expect(component.filteredNFt).toEqual([nftAuctionModel2, nftAuctionModel3]);
    });

    it('should filter all nfts with price greater than 100', () => {
      const mockedNftCard2: NftCardModel = JSON.parse(JSON.stringify(mockedNftCard));
      const mockedNftCard3: NftCardModel = JSON.parse(JSON.stringify(mockedNftCard));
      mockedNftCard2.listing.price = 300;
      mockedNftCard3.listing.price = 70;
      const nftAuctionModel: NftAuctionModel = {
        nft: mockedNftCard,
        auction: undefined
      };
      const nftAuctionModel2: NftAuctionModel = {
        nft: mockedNftCard2,
        auction: undefined
      };
      const nftAuctionModel3: NftAuctionModel = {
        nft: mockedNftCard3,
        auction: undefined
      };
      component.saleNFTs = [mockedNftCard, mockedNftCard2, mockedNftCard3];
      component.pricefilterValue = 'Greater Than 100';
      component.Collection = 'some';

      component.PriceFilter('Greater Than 100', 'price');

      expect(component.filteredNFt).toEqual([nftAuctionModel2]);
    });

    it('should filter all nfts', () => {
      spyOn(component, 'getListing');
      const mockedNftCard2: NftCardModel = JSON.parse(JSON.stringify(mockedNftCard));
      const mockedNftCard3: NftCardModel = JSON.parse(JSON.stringify(mockedNftCard));
      mockedNftCard2.listing.price = 30;
      mockedNftCard3.listing.price = 70;
      const nftAuctionModel: NftAuctionModel = {
        nft: mockedNftCard,
        auction: undefined
      };
      const nftAuctionModel2: NftAuctionModel = {
        nft: mockedNftCard2,
        auction: undefined
      };
      const nftAuctionModel3: NftAuctionModel = {
        nft: mockedNftCard3,
        auction: undefined
      };
      component.saleNFTs = [mockedNftCard, mockedNftCard2, mockedNftCard3];
      component.pricefilterValue = 'All';
      component.Collection = 'all';

      component.PriceFilter('', 'type');

      expect(component.filteredNFt).toEqual([nftAuctionModel, nftAuctionModel2, nftAuctionModel3]);
    });
  });
});
