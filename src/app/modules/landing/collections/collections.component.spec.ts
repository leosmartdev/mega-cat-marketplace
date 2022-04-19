import { ComponentFixture, TestBed } from '@angular/core/testing';
import { LandingCollectionsComponent } from './collections.component';
import { ProductService } from '../../../core/product/product.service';
import { CartService } from '../../../core/cart/cart.service';
import { ActivatedRoute, Router } from '@angular/router';
import { from, of, throwError } from 'rxjs';
import { FormBuilder, Validators } from '@angular/forms';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { BsModalService } from 'ngx-bootstrap/modal';
import { ErrorsService } from 'app/core/errors/errors.service';
import { MatSnackBarModule } from '@angular/material/snack-bar';
import { AuctionService } from 'app/core/auction/auction.service';
import { AuthService } from 'app/core/auth/auth.service';
import { NftUtilsService } from 'app/shared/nft-utils.service';
import { mockedNftAuctionResponse, mockedNftCard, mockedOfferResponse } from 'app/core/auction/spec-files/mocked';
import { mockedCartItem, mockedSaleNFt } from '../cart/spec-files/mocked';
import { NftCardModel } from 'app/core/models/nft-card.model';

describe('CollectionsComponent', () => {
  let component: LandingCollectionsComponent;
  let fixture: ComponentFixture<LandingCollectionsComponent>;
  enum ListingCategory {
    SALE = 'sale',
    AUCTION = 'auction'
  }
  const mockedAuctionModel = {
    nft: mockedNftCard,
    auction: mockedNftAuctionResponse.auction
  };
  const productServiceMock = jasmine.createSpyObj('ProductService', ['getSaleNFTs', 'listForSale', 'filterProducts', 'searchProducts', 'getAllListings', 'getAllReadyListings']);
  const fakeProducts = [];
  const errorsServiceMock = jasmine.createSpyObj('ErrorsService', ['openSnackBar']);
  const cartServiceMock = jasmine.createSpyObj('CartService', ['addItemToCart']);
  const routerMock = jasmine.createSpyObj('Router', ['']);
  productServiceMock.getSaleNFTs.and.returnValue(from(fakeProducts));
  productServiceMock.getAllListings.and.returnValue(from(fakeProducts));
  productServiceMock.getAllReadyListings.and.returnValue(from(fakeProducts));
  productServiceMock.listForSale.and.returnValue(from(fakeProducts));
  productServiceMock.filterProducts.and.returnValue(from(fakeProducts));
  productServiceMock.searchProducts.and.returnValue(from(fakeProducts));

  const auctionServiceMock = jasmine.createSpyObj(['AuctionService', ['getOnGoingAuctions']]);
  auctionServiceMock.getOnGoingAuctions.and.returnValue(of(fakeProducts));
  const authServiceMock = jasmine.createSpyObj('AuthService', ['accessToken'], ['get']);
  authServiceMock.accessToken.and.callThrough();
  const nftServiceMock = jasmine.createSpyObj('NftUtilsService', ['buildNftCardFromVenlyOffer']);

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [LandingCollectionsComponent],
      imports: [HttpClientTestingModule, MatSnackBarModule],
      providers: [
        { provide: FormBuilder },
        { provide: ProductService, useValue: productServiceMock },
        { provide: AuctionService, useValue: auctionServiceMock },
        { provide: Router, useValue: jasmine.createSpy('routerMock') },
        { provide: Router, useValue: routerMock },
        { provide: ActivatedRoute, useValue: jasmine.createSpy('activatedRouteMock') },
        { provide: BsModalService },
        { provide: ErrorsService },
        { provide: AuthService, useValue: authServiceMock },
        { provide: ErrorsService, useValue: errorsServiceMock },
        { provide: CartService, useValue: cartServiceMock },
        { provide: NftUtilsService, useValue: nftServiceMock }
      ]
    }).compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(LandingCollectionsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  afterEach(() => {
    fixture.destroy();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  describe('category', () => {
    it('should get all auction listings', () => {
      const spyProcess = spyOn<any>(component, 'processListingResponse');
      auctionServiceMock.getOnGoingAuctions.and.returnValue(of([mockedNftAuctionResponse]));

      component.category(ListingCategory.AUCTION);

      expect(spyProcess).toHaveBeenCalled();
      expect(component.filter.status.listingCategory).toEqual(ListingCategory.AUCTION);
    });

    it('should respond with an error if auction response fails', () => {
      auctionServiceMock.getOnGoingAuctions.and.returnValue(throwError('Something went wrong!'));

      component.category(ListingCategory.AUCTION);

      expect(auctionServiceMock.getOnGoingAuctions).toHaveBeenCalled();
      expect(errorsServiceMock.openSnackBar).toHaveBeenCalledWith('Something went wrong!', 'Error');
    });

    it('should respond with an error if get listings response fails', () => {
      productServiceMock.getAllReadyListings.and.returnValue(throwError('Something went wrong!'));

      component.category(ListingCategory.SALE);

      expect(errorsServiceMock.openSnackBar).toHaveBeenCalledWith('Something went wrong!', 'Error');
    });
  });

  it('should filter the nfts on price', () => {
    component.minValue = '50';
    component.maxValue = '150';
    const mocked: NftCardModel = JSON.parse(JSON.stringify(mockedNftCard));
    mocked.listing.price = 70;
    component.saleNFTs = [mocked];

    component.priceFilter();

    expect(component.filteredNFt[0] as any).toEqual(mocked);
  });

  describe('searchProducts', () => {
    it('should respond with all products', () => {
      component.products = [mockedAuctionModel];

      component.searchProducts();

      expect(component.filteredNFt).toEqual(component.products);
    });

    it('should filter nfts with search keyword', () => {
      component.filteredNFt = [mockedAuctionModel];
      component.searchForm.controls['search'].setValue(mockedNftCard.name);

      component.searchProducts();

      expect(component.filteredNFt).toEqual([mockedAuctionModel]);
    });
  });

  describe('filterProducts', () => {
    it('should sort the nfts according to latest creation date', () => {
      const auctionModel2 = JSON.parse(JSON.stringify(mockedAuctionModel));
      auctionModel2.nft.listing.createdOn = new Date('2000-02-23');
      component.filteredNFt = [mockedAuctionModel, auctionModel2, mockedAuctionModel];
      component.sort = 'Listings(Latest)';

      component.filterProducts();

      expect(component.filteredNFt).toEqual([mockedAuctionModel, mockedAuctionModel, auctionModel2]);
    });

    it('should sort nfts according to oldest creation date', () => {
      const auctionModel2 = JSON.parse(JSON.stringify(mockedAuctionModel));
      auctionModel2.nft.listing.createdOn = new Date('2000-02-23');
      component.filteredNFt = [mockedAuctionModel, auctionModel2, mockedAuctionModel];
      component.sort = 'Listings(Oldest)';

      component.filterProducts();

      expect(component.filteredNFt).toEqual([auctionModel2, mockedAuctionModel, mockedAuctionModel]);
    });

    it('should sort nfts according to highest price', () => {
      const auctionModel2 = JSON.parse(JSON.stringify(mockedAuctionModel));
      auctionModel2.nft.listing.price = 1000;
      component.filteredNFt = [mockedAuctionModel, auctionModel2, mockedAuctionModel];
      component.sort = 'Price(Highest)';

      component.filterProducts();

      expect(component.filteredNFt).toEqual([auctionModel2, mockedAuctionModel, mockedAuctionModel]);
    });

    it('should sort nfts according to lowest price', () => {
      const auctionModel2 = JSON.parse(JSON.stringify(mockedAuctionModel));
      auctionModel2.nft.listing.price = 1000;
      component.filteredNFt = [mockedAuctionModel, auctionModel2, mockedAuctionModel];
      component.sort = 'Price(Lowest)';

      component.filterProducts();

      expect(component.filteredNFt).toEqual([mockedAuctionModel, mockedAuctionModel, auctionModel2]);
    });
  });

  describe('handleInputChange', () => {
    it('should respond with all products', () => {
      component.products = [mockedAuctionModel];

      component.handleInputChange();

      expect(component.filteredNFt).toEqual(component.products);
    });

    it('should filter nfts with search keyword', () => {
      component.products = [mockedAuctionModel];
      component.searchForm.controls['search'].setValue(mockedNftCard.name);

      component.handleInputChange();

      expect(component.filteredNFt).toEqual([mockedAuctionModel]);
    });
  });

  it('should add an item to the cart', () => {
    const expectedResponse = mockedCartItem;
    expectedResponse.count = 1;
    expectedResponse.subTotal = expectedResponse.price;

    component.addToCart(mockedSaleNFt);

    expect(cartServiceMock.addItemToCart).toHaveBeenCalledWith(expectedResponse);
  });

  describe('processListingResponse', () => {
    it('should process the sale listing response', () => {
      nftServiceMock.buildNftCardFromVenlyOffer.and.returnValue(mockedNftCard);
      component.filter.status.listingCategory = ListingCategory.SALE;

      (component as any).processListingResponse({ data: [mockedOfferResponse] });

      expect(component.filteredNFt).toEqual([{ nft: mockedNftCard, auction: undefined }]);
    });

    it('should process the auction listing response', () => {
      nftServiceMock.buildNftCardFromVenlyOffer.and.returnValue(mockedNftCard);
      component.filter.status.listingCategory = ListingCategory.AUCTION;

      (component as any).processListingResponse({ data: [mockedOfferResponse] });

      expect(component.filteredNFt).toEqual([{ nft: mockedNftCard, auction: mockedOfferResponse.auction }]);
    });
  });
});
