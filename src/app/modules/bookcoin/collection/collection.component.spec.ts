import { ActivatedRoute, Router } from '@angular/router';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { from, of, throwError } from 'rxjs';
import { CollectionComponent, NftAuctionModel } from './collection.component';
import { ProductService } from 'app/core/product/product.service';
import { ErrorsService } from 'app/core/errors/errors.service';
import { CartService } from 'app/core/cart/cart.service';
import { HomepageService } from 'app/core/homepage/homepage.service';
import { NftUtilsService } from 'app/shared/nft-utils.service';
import { mockedCartItem, mockedSaleNFt } from 'app/modules/landing/cart/spec-files/mocked';
import { mockedNftDrop } from 'app/feature/drops/spec-files/mocked';
import { mockedNft, mockedNftCard, mockedOfferResponse, mockUser } from 'app/core/auction/spec-files/mocked';
import { mockedProduct } from './spec-files/mocked';
import { Product } from 'app/core/product/product';
import { Offer } from 'app/core/models/offer.model';
import { AuctionService } from 'app/core/auction/auction.service';

describe('CollectionsComponent', () => {
  let component: CollectionComponent;
  let fixture: ComponentFixture<CollectionComponent>;

  const mockedNftAuctionModel: NftAuctionModel = {
    nft: mockedNftCard,
    auction: undefined
  };

  enum ListingCategory {
    SALE = 'buy',
    AUCTION = 'auction'
  }

  const cartServiceMock = jasmine.createSpyObj('CartService', ['addItemToCart']);
  const auctionServiceMock = jasmine.createSpyObj('AuctionService', ['getOnGoingAuctions']);
  const errorServiceMock = jasmine.createSpyObj('ErrorService', ['openSnackBar']);
  const productServiceMock = jasmine.createSpyObj('ProductService', ['getAllListings', 'getUserOfCollection', 'getAllReadyListings', 'getUserOfCollection', 'getCollectionDetail']);
  const homepageServiceMock = jasmine.createSpyObj('HomepageService', ['getDrops']);
  const routerMock = jasmine.createSpyObj('Router', ['']);
  const activatedRouteMock = jasmine.createSpyObj('ActivatedRoute', ['snapshot']);
  const nftServiceMock = jasmine.createSpyObj('NftUtilsService', ['getFallbackImage', 'buildNftCardFromVenlyOffer']);

  routerMock.url = '/collection/p/';
  activatedRouteMock.snapshot = {
    params: {
      contractAddress: 'something',
      id: '4',
      nftId: '092834'
    }
  };
  const fakeProducts = [];
  const fakeDrops = [mockedNftDrop];
  productServiceMock.getAllListings.and.returnValue(from(fakeProducts));
  productServiceMock.getAllReadyListings.and.returnValue(of({}));
  auctionServiceMock.getOnGoingAuctions.and.returnValue(of({}));

  homepageServiceMock.getDrops.and.returnValue(of({ data: fakeDrops }));
  productServiceMock.getCollectionDetail.and.returnValue(of({}));

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [CollectionComponent],
      providers: [
        { provide: ProductService, useValue: productServiceMock },
        { provide: HomepageService, useValue: homepageServiceMock },
        { provide: ErrorsService, useValue: errorServiceMock },
        { provide: CartService, useValue: cartServiceMock },
        { provide: Router, useValue: routerMock },
        { provide: ActivatedRoute, useValue: activatedRouteMock },
        { provide: NftUtilsService, useValue: nftServiceMock },
        { provide: AuctionService, useValue: auctionServiceMock }
      ]
    }).compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(CollectionComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
    component.colDate = [new Date()];
  });

  afterEach(() => {
    fixture.destroy();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should add an item to the cart', () => {
    const expectedResponse = mockedCartItem;
    expectedResponse.count = 1;
    expectedResponse.subTotal = expectedResponse.price;

    component.addToCart(mockedSaleNFt);

    expect(cartServiceMock.addItemToCart).toHaveBeenCalledWith(expectedResponse);
  });

  it('should get fallback image on error', () => {
    const nft = { ...mockedNft };
    nftServiceMock.getFallbackImage.and.returnValue('test.png');

    component.imageError(nft);

    expect(nft.imageUrl).toEqual('test.png');
  });

  describe('LoadMore', () => {
    it('should load more nfts if current nfts are behind 3 or more from filtered nfts', () => {
      component.filteredNFts = [mockedNftAuctionModel, mockedNftAuctionModel, mockedNftAuctionModel, mockedNftAuctionModel];
      component.currentCount = 0;

      component.loadMore();

      expect(component.currentCount).toEqual(3);
    });

    it('should load more nfts if current nfts are less than 3 behind', () => {
      component.filteredNFts = [mockedNftAuctionModel, mockedNftAuctionModel];
      component.currentCount = 0;

      component.loadMore();

      expect(component.currentCount).toEqual(2);
    });
  });

  describe('PriceFilter', () => {
    it('should filter all nfts with price less than 50', () => {
      const mockedProduct2: Product = JSON.parse(JSON.stringify(mockedProduct));
      const mockedProduct3: Product = JSON.parse(JSON.stringify(mockedProduct));
      mockedProduct2.price = 30;
      mockedProduct3.price = 70;
      component.saleNFTs = [mockedProduct, mockedProduct2, mockedProduct3];
      component.pricefilterValue = 'Some';

      component.PriceFilter('Less Than 50', 'price');

      expect(component.filteredNFts as any).toEqual([mockedProduct, mockedProduct2]);
    });

    it('should filter all nfts with price in between 50 and 100', () => {
      const mockedProduct2: Product = JSON.parse(JSON.stringify(mockedProduct));
      const mockedProduct3: Product = JSON.parse(JSON.stringify(mockedProduct));
      mockedProduct2.price = 60;
      mockedProduct3.price = 80;
      component.saleNFTs = [mockedProduct, mockedProduct2, mockedProduct3];
      component.pricefilterValue = 'Some';

      component.PriceFilter('50-100', 'price');

      expect(component.filteredNFts as any).toEqual([mockedProduct2, mockedProduct3]);
    });

    it('should filter all nfts with price greater than 100', () => {
      const mockedProduct2: Product = JSON.parse(JSON.stringify(mockedProduct));
      const mockedProduct3: Product = JSON.parse(JSON.stringify(mockedProduct));
      mockedProduct2.price = 300;
      mockedProduct3.price = 70;
      component.saleNFTs = [mockedProduct, mockedProduct2, mockedProduct3];
      component.pricefilterValue = 'Some';

      component.PriceFilter('Greater Than 100', 'price');

      expect(component.filteredNFts as any).toEqual([mockedProduct2]);
    });

    it('should filter all nfts', () => {
      const mockedProduct2: Product = JSON.parse(JSON.stringify(mockedProduct));
      const mockedProduct3: Product = JSON.parse(JSON.stringify(mockedProduct));
      mockedProduct2.price = 30;
      mockedProduct3.price = 70;
      component.saleNFTs = [mockedProduct, mockedProduct2, mockedProduct3];
      component.pricefilterValue = 'All';

      component.PriceFilter('', '');

      expect(component.filteredNFts as any).toEqual([mockedProduct, mockedProduct2, mockedProduct3]);
    });
  });

  describe('OpenPanel', () => {
    it('should set active panel to provided panel name', () => {
      component.activePanel = 'Some Panel';

      component.openPanel('Test Panel');

      expect(component.activePanel).toEqual('Test Panel');
    });

    it('should set active panel to nil', () => {
      component.activePanel = 'Test Panel';

      component.openPanel('Test Panel');

      expect(component.activePanel).toEqual('');
    });
  });

  it('should respond with an error if auction response fails', () => {
    component.SaleType = ListingCategory.AUCTION;
    auctionServiceMock.getOnGoingAuctions.and.returnValue(throwError('Something went wrong!'));

    component.getAuctionListing();

    expect(auctionServiceMock.getOnGoingAuctions).toHaveBeenCalled();
    expect(errorServiceMock.openSnackBar).toHaveBeenCalledWith('Something went wrong!', 'Error');
  });

  it('should respond with an error if get listings response fails', () => {
    component.SaleType = ListingCategory.SALE;
    productServiceMock.getAllReadyListings.and.returnValue(throwError('Something went wrong!'));

    component.getSaleListing();

    expect(errorServiceMock.openSnackBar).toHaveBeenCalledWith('Something went wrong!', 'Error');
  });

  describe('processListingResponse', () => {
    it('should process the sale listing response', () => {
      component.id = mockedOfferResponse.nft.contract.address;
      nftServiceMock.buildNftCardFromVenlyOffer.and.returnValue(mockedNftCard);
      productServiceMock.getUserOfCollection.and.returnValue(of({ data: mockUser, date: [new Date()] }));

      (component as any).processListingResponse({ data: [mockedOfferResponse] });

      expect(component.filteredNFts).toEqual([{ nft: mockedNftCard, auction: undefined }]);
    });

    it('should process the auction listing response', () => {
      component.id = mockedOfferResponse.nft.contract.address;
      nftServiceMock.buildNftCardFromVenlyOffer.and.returnValue(mockedNftCard);
      productServiceMock.getUserOfCollection.and.returnValue(of({ data: mockUser, date: [new Date()] }));

      (component as any).processAuctionResponse({ data: [mockedOfferResponse] });

      expect(component.auctionNfts).toEqual([{ nft: mockedNftCard, auction: mockedOfferResponse.auction }]);
    });
  });
});
