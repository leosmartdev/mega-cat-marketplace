import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MyAuctionsComponent } from './my-auctions.component';
import { ErrorsService } from 'app/core/errors/errors.service';
import { ProductService } from 'app/core/product/product.service';
import { AuthService } from 'app/core/auth/auth.service';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { Router } from '@angular/router';
import { AngularFireAuthModule } from '@angular/fire/compat/auth';
import { AngularFireModule } from '@angular/fire/compat';
import { environment } from 'environments/environment';
import { from, of } from 'rxjs';
import { AuctionService } from 'app/core/auction/auction.service';
import { mockedNft, mockedNftCard, mockedOfferResponse, mockUser } from 'app/core/auction/spec-files/mocked';
import { NftUtilsService } from 'app/shared/nft-utils.service';

describe('MyAuctionsComponent', () => {
  let component: MyAuctionsComponent;
  let fixture: ComponentFixture<MyAuctionsComponent>;
  const authServiceMock = jasmine.createSpyObj('AuthService', ['isAdmin', 'user']);
  authServiceMock.user = mockUser;
  authServiceMock.isAdmin.and.returnValue(of(false));
  const auctionServiceMock = jasmine.createSpyObj('AuctionService', ['getAllCreatedByUser']);
  const nftServiceMock = jasmine.createSpyObj('NftUtilsService', ['buildNftCardFromVenlyOffer', 'getFallbackImage']);
  auctionServiceMock.getAllCreatedByUser.and.returnValue(from([]));

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [MyAuctionsComponent],
      imports: [HttpClientTestingModule, AngularFireModule.initializeApp(environment.firebase), AngularFireAuthModule],
      providers: [
        { provide: Router, useValue: jasmine.createSpy('routerMock') },
        {
          provide: ErrorsService,
          useValue: {}
        },
        { provide: ProductService },
        { provide: AuthService, useValue: authServiceMock },
        { provide: AuctionService, useValue: auctionServiceMock },
        { provide: NftUtilsService, useValue: nftServiceMock }
      ]
    }).compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(MyAuctionsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
    component.filteredNFTs = [];
  });

  afterEach(() => {
    fixture.destroy();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should get all auctions created by user', () => {
    const spyProcess = spyOn(component, 'processAuctionsResponse').and.callFake(() => {});
    auctionServiceMock.getAllCreatedByUser.and.returnValue(of({ data: [mockedOfferResponse] }));

    component.getAuctionsCreatedByUser();

    expect(component.isFetching).toBe(false);
    expect(spyProcess).toHaveBeenCalledWith([mockedOfferResponse]);
  });

  it('should process auction response and update nfts', () => {
    const expectedResponse = {
      nft: mockedNftCard,
      auction: mockedOfferResponse.auction
    };
    nftServiceMock.buildNftCardFromVenlyOffer.and.returnValue(mockedNftCard);

    component.processAuctionsResponse([mockedOfferResponse]);

    expect(component.filteredNFTs).toEqual([expectedResponse]);
    expect(nftServiceMock.buildNftCardFromVenlyOffer).toHaveBeenCalledWith({ offer: mockedOfferResponse, marketplaceType: 'listing-auction' });
  });

  it('should get user info', () => {
    const response = component.getUser();

    expect(response).toEqual(mockUser);
  });

  it('should get fallback image on error', () => {
    const nft = { ...mockedNft };
    nftServiceMock.getFallbackImage.and.returnValue('test.png');

    component.imageError(nft);

    expect(nft.imageUrl).toEqual('test.png');
  });
});
