import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ActivatedRoute, Router } from '@angular/router';
import { NftDetailComponent } from './nft-detail.component';
import { VenlyService } from 'app/core/venly/venly.service';
import { ProductService } from 'app/core/product/product.service';
import { mockedOfferResponse, mockUser } from 'app/core/auction/spec-files/mocked';
import { of } from 'rxjs';
import { mockedNftMetadata } from 'app/modules/landing/nft-details/spec-files/mocked';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';

describe('NftDetailComponent', () => {
  let component: NftDetailComponent;
  let fixture: ComponentFixture<NftDetailComponent>;
  const routerMock = jasmine.createSpyObj('Router', ['navigateByUrl']);
  const productServiceMock = jasmine.createSpyObj('ProductService', ['specificOffer', 'getUserOfCollection']);
  const venlyServiceMock = jasmine.createSpyObj('VenlyService', ['fetchNftMetadata']);
  const activatedRouteMock = jasmine.createSpyObj('ActivatedRoute', ['snapshot']);
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
  const mockedMetadata = JSON.parse(JSON.stringify(mockedNftMetadata));
  mockedMetadata.metadata = {
    ...mockedMetadata.metadata,
    contract: {
      media: [
        { type: 'collectionId', value: 'testId' },
        { type: 'about', value: 'test' }
      ]
    }
  };
  mockedMetadata.metadata.attributes = [
    {
      name: 'test'
    },
    { name: 'story' },
    { name: 'tos' },
    { name: 'faqs' },
    { name: 'perks' }
  ];
  const mockedOffer = { data: mocked };
  productServiceMock.specificOffer.and.returnValue(of(mockedOffer));
  productServiceMock.getUserOfCollection.and.returnValue(of(mockedOffer));
  venlyServiceMock.fetchNftMetadata.and.returnValue(of({ data: mockedNftMetadata }));

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [NftDetailComponent],
      imports: [BrowserAnimationsModule],
      providers: [
        { provide: Router, useValue: jasmine.createSpy('routerMock') },
        { provide: ProductService, useValue: productServiceMock },
        { provide: Router, useValue: routerMock },
        {
          provide: ActivatedRoute,
          useValue: {
            params: of({
              contractAddress: 2,
              tokenId: 1
            })
          }
        },
        { provide: VenlyService, useValue: venlyServiceMock }
      ]
    }).compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(NftDetailComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  afterEach(() => {
    fixture.destroy();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should create an nft page', () => {
    venlyServiceMock.fetchNftMetadata.and.returnValue(of({ data: mockedMetadata }));

    component.nftPage(mockedNftMetadata.contract.address, '123');

    expect(component.attributes).toEqual([{ name: 'test' }]);
    expect(component.colId).toEqual('testId');
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
});
