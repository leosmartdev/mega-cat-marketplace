import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ModalComponent } from './modal.component';
import { BsModalService } from 'ngx-bootstrap/modal';
import { CartService } from 'app/core/cart/cart.service';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { mockedNftCard } from 'app/core/auction/spec-files/mocked';

describe('ModalComponent', () => {
  let component: ModalComponent;
  let fixture: ComponentFixture<ModalComponent>;
  const cartServiceMock = jasmine.createSpyObj('AuthService', ['cardProcessingFee', 'getCartItems', 'getItemsSum', 'addItemToCart']);
  const expectedResponse = {
    _id: mockedNftCard.listing.id,
    name: mockedNftCard.name,
    tokenId: mockedNftCard.tokenId,
    smartContractAddress: mockedNftCard.contract.address,
    image: mockedNftCard.image,
    price: mockedNftCard.listing.price,
    count: 1,
    subTotal: mockedNftCard.listing.price,
    sellerAddress: mockedNftCard.listing.sellerAddress
  };
  cartServiceMock.getCartItems.and.returnValue([]);
  cartServiceMock.cardProcessingFee = 2;
  cartServiceMock.getItemsSum.and.returnValue(0);

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ModalComponent],
      imports: [HttpClientTestingModule],
      providers: [{ provide: BsModalService }, { provide: CartService, useValue: cartServiceMock }]
    }).compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(ModalComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should add an item to the cart', () => {
    mockedNftCard.image = 'test.png';
    component.addToCart(mockedNftCard);

    expect(cartServiceMock.addItemToCart).toHaveBeenCalledWith(expectedResponse);
  });
});
