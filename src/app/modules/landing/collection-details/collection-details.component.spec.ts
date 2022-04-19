import { ComponentFixture, TestBed } from '@angular/core/testing';
import { CollectionDetailsComponent } from './collection-details.component';
import { ActivatedRoute, Router } from '@angular/router';
import { ProductService } from '../../../core/product/product.service';
import { CartService } from '../../../core/cart/cart.service';
import { BsModalService } from 'ngx-bootstrap/modal';
import { from, of } from 'rxjs';
import { mockedCartItem, mockedSaleNFt } from '../cart/spec-files/mocked';

describe('CollectionDetailsComponent', () => {
  let component: CollectionDetailsComponent;
  let fixture: ComponentFixture<CollectionDetailsComponent>;

  const productServiceMock = jasmine.createSpyObj('ProductService', ['specificOffer', 'getProducts', 'getProduct']);
  const cartServiceMock = jasmine.createSpyObj('CartService', ['addItemToCart']);

  beforeEach(async () => {
    const fakeProducts = [];
    const mockedProduct: any = {
      id: 0,
      name: 'test name',
      description: 'some dx',
      tokenId: '0x1019238',
      image: '',
      price: 59.99,
      metadataStatus: 'frozen',
      properties: [],
      hasError: () => false
    };

    // TODO: Implement this model
    const mockedOffer: any = {};

    const fakeProduct: any = {
      data: mockedProduct
    };

    productServiceMock.getProducts.and.returnValue(from(fakeProducts));
    productServiceMock.getProduct.and.returnValue(of(fakeProduct));
    productServiceMock.specificOffer.and.returnValue(of(mockedOffer));

    await TestBed.configureTestingModule({
      declarations: [CollectionDetailsComponent],
      providers: [
        { provide: ProductService, useValue: productServiceMock },
        { provide: CartService, useValue: cartServiceMock },
        { provide: BsModalService },
        { provide: Router, useValue: jasmine.createSpy('routerMock') },
        {
          provide: ActivatedRoute,
          useValue: {
            snapshot: {
              params: [{ id: 1 }]
            }
          }
        }
      ]
    }).compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(CollectionDetailsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
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
});
