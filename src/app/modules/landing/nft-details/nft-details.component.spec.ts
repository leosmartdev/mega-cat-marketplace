import { HttpClient } from '@angular/common/http';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ActivatedRoute, Router } from '@angular/router';
import { mockedOfferResponse } from 'app/core/auction/spec-files/mocked';
import { CartService } from 'app/core/cart/cart.service';
import { ProductService } from 'app/core/product/product.service';
import { VenlyService } from 'app/core/venly/venly.service';
import { NftUtilsService } from 'app/shared/nft-utils.service';
import { from, Observable, of } from 'rxjs';

import { NftDetailsComponent } from './nft-details.component';
import { mockedNftMetadata } from './spec-files/mocked';

describe('NftDetailsComponent', () => {
  let component: NftDetailsComponent;
  let fixture: ComponentFixture<NftDetailsComponent>;
  const routeMock = jasmine.createSpyObj('ActivatedRoute', ['snapshot', 'queryParams']);
  routeMock.queryParams = new Observable((observer) => {
    observer.next({ auctionId: '123' });
  });
  routeMock.snapshot = {
    params: {
      contractAddress: 'something',
      tokenId: '4',
      nftId: '092834'
    }
  };

  const cartServiceMock = jasmine.createSpyObj('CartService', ['addItemToCart']);

  const productServiceMock = jasmine.createSpyObj('ProductService', ['specificOffer', 'getAllListings']);
  productServiceMock.getAllListings.and.returnValue(from([]));

  const venlyServiceMock = jasmine.createSpyObj('VenlyService', ['fetchNftMetadata']);
  venlyServiceMock.fetchNftMetadata.and.returnValue(of({ message: 'some message', data: mockedNftMetadata }));

  const nftUtilsServiceMock = jasmine.createSpyObj('nftUtilsService', ['getFallbackImage']);

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [NftDetailsComponent],
      imports: [HttpClientTestingModule],
      providers: [
        { provide: CartService, useValue: cartServiceMock },
        { provide: ActivatedRoute, useValue: routeMock },
        { provide: ProductService, useValue: productServiceMock },
        { provide: VenlyService, useValue: venlyServiceMock },
        { provide: NftUtilsService, useValue: nftUtilsServiceMock },
        { provide: HttpClient }
      ]
    }).compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(NftDetailsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  afterEach(() => {
    fixture.destroy();
  });

  // TODO: Fix the HTML marup to not fail the error below:
  // -> TypeError: Cannot read properties of undefined (reading 'nft')
  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should add an item to cart', () => {
    const spyAddtoCart = cartServiceMock.addItemToCart.and.callThrough();
    component.nft = mockedNftMetadata;

    component.preProcessAddToCart({ id: 'test offer', price: 10, sellerAddress: 'test address' });
    expect(spyAddtoCart).toHaveBeenCalledTimes(1);
  });

  it('should respond with fallback image', () => {
    const spyFallbackImage = nftUtilsServiceMock.getFallbackImage.and.returnValue('test1.png');

    const res = component.imageError();
    expect(component.nft.metadata.image).toEqual('test1.png');
  });

  it('should return seller Address', () => {
    component.sellerAddress = 'test address';

    expect(component.truncateSeller()).toEqual('test address');
  });

  describe('fetchProduct', () => {
    it('should fetch specific offer', () => {
      const spySpecificOffer = productServiceMock.specificOffer.and.returnValue(of({ data: mockedOfferResponse }));

      component.fetchProduct('test address', '123', mockedOfferResponse.id);

      expect(component.listing).toEqual(mockedOfferResponse);
      expect(component.isLoading).toBe(false);
    });

    it('should not set the listing', () => {
      const spySpecificOffer = productServiceMock.specificOffer.and.returnValue(of(null));

      component.fetchProduct('test address', '123', mockedOfferResponse.id);

      expect(component.listing).toBe(null);
    });
  });
});
