import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ActivatedRoute, Router } from '@angular/router';
import { CollectionDetailComponent } from './collection-detail.component';
import { AuthService } from 'app/core/auth/auth.service';
import { of, throwError } from 'rxjs';
import { CartService } from 'app/core/cart/cart.service';
import { ProductService } from 'app/core/product/product.service';
import { mockedOfferResponse, mockUser } from 'app/core/auction/spec-files/mocked';
import { VenlyService } from 'app/core/venly/venly.service';
import { mockedNftMetadata } from 'app/modules/landing/nft-details/spec-files/mocked';
import { NftUtilsService } from 'app/shared/nft-utils.service';

describe('CollectionDetailComponent', () => {
  let component: CollectionDetailComponent;
  let fixture: ComponentFixture<CollectionDetailComponent>;
  const authServiceMock = jasmine.createSpyObj('AuthService', ['check', 'user']);
  authServiceMock.check.and.returnValue(of(true));
  const cartServiceMock = jasmine.createSpyObj('CartService', ['addItemToCart']);
  const routerMock = jasmine.createSpyObj('Router', ['navigateByUrl']);
  const productServiceMock = jasmine.createSpyObj('ProductService', ['specificOffer', 'getUserOfCollection']);
  const venlyServiceMock = jasmine.createSpyObj('VenlyService', ['fetchNftMetadata']);
  const activatedRouteMock = jasmine.createSpyObj('ActivatedRoute', ['snapshot']);
  const nftServiceMock = jasmine.createSpyObj('NftUtilsService', ['getFallbackImage']);

  activatedRouteMock.snapshot = {
    params: {
      id: null,
      contractAddress: null,
      tokenId: null
    }
  };
  const mocked = mockedOfferResponse as any;
  mocked.nft.attributes = [
    {
      name: 'test'
    }
  ];
  const mockedOffer = { data: mocked };

  authServiceMock.user = mockUser;
  productServiceMock.specificOffer.and.returnValue(of(mockedOffer));
  productServiceMock.getUserOfCollection.and.returnValue(of(mockedOffer));
  venlyServiceMock.fetchNftMetadata.and.returnValue(of({}));

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [CollectionDetailComponent],
      providers: [
        { provide: Router, useValue: jasmine.createSpy('routerMock') },
        { provide: ProductService, useValue: productServiceMock },
        { provide: AuthService, useValue: authServiceMock },
        { provide: CartService, useValue: cartServiceMock },
        { provide: Router, useValue: routerMock },
        { provide: NftUtilsService, useValue: nftServiceMock },
        {
          provide: ActivatedRoute,
          useValue: activatedRouteMock
        },
        { provide: VenlyService, useValue: venlyServiceMock }
      ]
    }).compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(CollectionDetailComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  afterEach(() => {
    fixture.destroy();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should create with collection page', () => {
    fixture.destroy();
    activatedRouteMock.snapshot.params.id = '123';
    fixture = TestBed.createComponent(CollectionDetailComponent);
    component = fixture.componentInstance;
    spyOn(component, 'collectionPage');
    fixture.detectChanges();

    expect(component.collectionPage).toHaveBeenCalled();
  });

  it('should create with nft page', () => {
    fixture.destroy();
    activatedRouteMock.snapshot.params.id = null;
    activatedRouteMock.snapshot.params.tokenId = '123';
    activatedRouteMock.snapshot.params.contractAddress = 'someAddress';

    fixture = TestBed.createComponent(CollectionDetailComponent);
    component = fixture.componentInstance;
    spyOn(component, 'nftPage');
    fixture.detectChanges();

    expect(component.nftPage).toHaveBeenCalled();
  });

  it('should get user info', () => {
    const response = component.getUser();

    expect(response).toEqual(mockUser);
  });

  describe('OpenPanel', () => {
    it('should set active panel to provided panel name', () => {
      component.activePanel = 'Some Panel';

      component.openPanel('Test Panel', 'activePanel');

      expect(component.activePanel).toEqual('Test Panel');
    });

    it('should set active panel to nil', () => {
      component.activePanel = 'Test Panel';

      component.openPanel('Test Panel', 'activePanel');

      expect(component.activePanel).toEqual('');
    });

    it('should set active panel2 to provided panel name', () => {
      component.activePanel2 = 'Some Panel';

      component.openPanel('Test Panel', 'activePanel2');

      expect(component.activePanel2).toEqual('Test Panel');
    });

    it('should set active panel2 to nil', () => {
      component.activePanel2 = 'Test Panel';

      component.openPanel('Test Panel', 'activePanel2');

      expect(component.activePanel2).toEqual('');
    });

    it('should set active panel3 to provided panel name', () => {
      component.activePanel3 = 'Some Panel';

      component.openPanel('Test Panel', 'activePanel3');

      expect(component.activePanel3).toEqual('Test Panel');
    });

    it('should set active panel3 to nil', () => {
      component.activePanel3 = 'Test Panel';

      component.openPanel('Test Panel', 'activePanel3');

      expect(component.activePanel3).toEqual('');
    });
  });

  it('should add item to the cart', () => {
    const mockOffer = JSON.parse(JSON.stringify(mockedOfferResponse));
    mockOffer.nft.collectionIdentifier = { value: 'xyz' };
    component.offerId = mockOffer.id;
    component.nft = mockOffer.nft;
    component.offerPrice = mockOffer.price;
    component.offerSellerAddress = mockOffer.sellerAddress;

    component.addToCart();

    expect(cartServiceMock.addItemToCart).toHaveBeenCalled();
    expect(routerMock.navigateByUrl).toHaveBeenCalledWith('/cart');
  });

  it('should setup the nft page', () => {
    venlyServiceMock.fetchNftMetadata.and.returnValue(of({ message: 'Got Metadata Successfully', data: mockedNftMetadata }));
    const spySetup = spyOn(component, '_commonSetup');

    component.nftPage('testAddress', '123');

    expect(component.nft).toEqual(mockedNftMetadata);
    expect(spySetup).toHaveBeenCalled();
  });

  it('should setup the collection page', () => {
    productServiceMock.specificOffer.and.returnValue(of({ data: mockedOfferResponse }));
    const spySetup = spyOn(component, '_commonSetup');

    component.collectionPage();

    expect(component.nft).toEqual(mockedOfferResponse.nft);
    expect(component.offerId).toEqual(mockedOfferResponse.id);
    expect(spySetup).toHaveBeenCalled();
  });

  it('should setup the common content of both pages', () => {
    mockedOffer.data.nft.attributes = [
      {
        name: 'test'
      },
      { name: 'story' },
      { name: 'tos' },
      { name: 'faqs' }
    ];
    component.nft = mockedOffer.data.nft;
    productServiceMock.getUserOfCollection.and.returnValue(of({ data: mockUser }));

    component._commonSetup();

    expect(component.username).toEqual(mockUser.username);
    expect(component.bio).toEqual(mockUser.bio);
    expect(component.colId).toEqual(mockedOfferResponse.nft.contract.media[0].value);
  });

  it('should setup the common content with story from media of an nft', () => {
    mockedOffer.data.nft.attributes = [
      {
        name: 'test'
      }
    ];
    component.nft = mockedOffer.data.nft;
    productServiceMock.getUserOfCollection.and.returnValue(of({ data: mockUser }));

    component._commonSetup();

    expect(component.username).toEqual(mockUser.username);
    expect(component.bio).toEqual(mockUser.bio);
    expect(component.colId).toEqual(mockedOfferResponse.nft.contract.media[0].value);
  });

  it('should not set user info if failed to get user of collection', () => {
    mockedOffer.data.nft.attributes = [
      {
        name: 'test'
      }
    ];
    component.username = 'no username available';
    component.nft = mockedOffer.data.nft;
    productServiceMock.getUserOfCollection.and.throwError('Some error');

    component._commonSetup();

    expect(component.username).toEqual('no username available');
  });

  it('should set the image to fallback image if failed to load source image', () => {
    component.nft = mocked.nft;
    nftServiceMock.getFallbackImage.and.returnValue('testImage.png');

    component.imageError();

    expect(component.nft.contract.imageUrl).toEqual('testImage.png');
  });
});
