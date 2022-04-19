import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AuctionDetailComponent } from './auction-detail.component';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { Router, ActivatedRoute, RouterModule } from '@angular/router';
import { AuctionService } from 'app/core/auction/auction.service';
import { mockedBid, mockedExpiredAuction, mockedNftAuctionResponse, mockedOfferResponse, mockUser } from 'app/core/auction/spec-files/mocked';
import { AuthService } from 'app/core/auth/auth.service';
import { WalletService } from 'app/core/wallet/wallet.service';
import { of } from 'rxjs';
import { ProductService } from 'app/core/product/product.service';
import { RouterTestingModule } from '@angular/router/testing';
import { CartService } from 'app/core/cart/cart.service';
import { WizardDialogService } from 'app/shared/wizard-dialog-service/wizard-dialog.service';
import Swal from 'sweetalert2';
import { mockedCartItem } from 'app/modules/landing/cart/spec-files/mocked';

describe('AuctionDetailComponent', () => {
  let component: AuctionDetailComponent;
  let fixture: ComponentFixture<AuctionDetailComponent>;
  const authServiceMock = jasmine.createSpyObj('AuthService', ['user'], ['get']);
  const routerMock = jasmine.createSpyObj('Router', ['navigate', 'url', 'navigateByUrl']);
  const auctionServiceMock = jasmine.createSpyObj('AuctionService', ['getOne', 'setupSocketConnection', 'addBid', 'disconnectSocket']);
  const walletServiceMock = jasmine.createSpyObj('WalletService', ['isWalletActive', 'getBalance']);

  auctionServiceMock.getOne.and.returnValue(of(mockedNftAuctionResponse));
  auctionServiceMock.setupSocketConnection.and.returnValue({ observableNewBid: of(mockedBid), observableExpireAuction: of(mockedExpiredAuction) });
  authServiceMock.user.and.returnValue(mockUser);
  const productServiceMock = jasmine.createSpyObj('ProductService', ['specificOffer', 'getUserOfCollection', 'getHistory']);
  const activatedRouteMock = jasmine.createSpyObj('ActivatedRoute', ['snapshot']);
  const cartServiceMock = jasmine.createSpyObj('CartService', ['addItemToCart']);
  const wizardServiceMock = jasmine.createSpyObj('WizardDialogService', ['advanceStages', 'showWizard', 'setError', 'failStage', 'close']);

  activatedRouteMock.snapshot = {
    params: {
      contract: 'something'
    }
  };
  const mocked = mockedOfferResponse as any;
  mocked.nft.attributes = [
    {
      name: 'test'
    }
  ];
  const mockedOffer = { data: mocked };

  productServiceMock.specificOffer.and.returnValue(of(mockedOffer));
  productServiceMock.getUserOfCollection.and.returnValue(of(mockedOffer));
  productServiceMock.getHistory.and.returnValue(of([]));
  routerMock.url = 'test.com';

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [AuctionDetailComponent],
      imports: [HttpClientTestingModule],
      providers: [
        { provide: ProductService, useValue: productServiceMock },
        { provide: AuthService, useValue: authServiceMock },
        { provide: Router, useValue: routerMock },
        {
          provide: ActivatedRoute,
          useValue: activatedRouteMock
        },
        { provide: AuctionService, useValue: auctionServiceMock },
        { provide: WizardDialogService, useValue: wizardServiceMock },
        { provide: WalletService, useValue: walletServiceMock },
        { provide: CartService, useValue: cartServiceMock }
      ]
    }).compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(AuctionDetailComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
    walletServiceMock.isWalletActive.and.returnValue(true);
    walletServiceMock.getBalance.and.returnValue(Promise.resolve('100'));
    component.auction = mockedNftAuctionResponse.auction;
  });

  afterEach(() => {
    component.OnDestroy();
    fixture.destroy();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should create with auction', () => {
    activatedRouteMock.snapshot = {
      params: {
        contract: 'something',
        auctionId: '18'
      }
    };

    expect(component).toBeTruthy();
    expect(component.auction).toEqual(mockedNftAuctionResponse.auction);
  });

  it('should get the count down config', () => {
    const response = component.countDownConfig.formatDate({ date: new Date().getTime(), formatStr: 'hh:mm:ss' });

    expect(response).toBeTruthy();
  });

  describe('placeBid', () => {
    it('should return if wallet is not connected', async () => {
      walletServiceMock.isWalletActive.and.returnValue(false);

      await component.placeBid();
      expect(component.connectWalletValidation).toBe(true);
    });

    it('should return if balance in wallet is less than user bid', async () => {
      component.userBid = 1000;

      await component.placeBid();
      expect(component.balanceValidation).toBe(true);
    });

    it('should return if user bid is less than max bid', async () => {
      component.userBid = 10;
      component.maxBid = { bidAmount: 15 };

      await component.placeBid();
      expect(component.bidValidation).toBe(true);
    });

    it('should respond with an alert if balance is not get successfully', async () => {
      component.userBid = mockedBid.bidAmount;
      component.maxBid = { bidAmount: 15 };
      walletServiceMock.getBalance.and.rejectWith('Failed to get balance!');
      spyOn(Swal, 'fire');

      await component.placeBid();

      expect(Swal.fire).toHaveBeenCalled();
    });

    it('should respond with an alert if user tries to out bid himself and return if user denies', async () => {
      component.userBid = mockedBid.bidAmount;
      component.maxBid = { bidAmount: 15, userId: { username: mockUser.email } };
      component.user = mockUser;
      spyOn(Swal, 'fire').and.resolveTo({ isDenied: true, isDismissed: true, isConfirmed: false });

      await component.placeBid();

      expect(Swal.fire).toHaveBeenCalled();
      expect(component.maxBid.bidAmount).toEqual(15);
    });

    it('should respond with an alert if user tries to out bid himself and place bid if user confirms', async () => {
      component.userBid = mockedBid.bidAmount;
      component.maxBid = { bidAmount: 15, userId: { username: mockUser.email } };
      component.user = mockUser;
      const spyAddBid = auctionServiceMock.addBid.and.returnValue(of(mockedNftAuctionResponse.auction));
      spyOn(Swal, 'fire').and.resolveTo({ isDenied: false, isDismissed: false, isConfirmed: true });

      await component.placeBid();

      expect(Swal.fire).toHaveBeenCalled();
      expect(component.maxBid).toEqual(mockedBid.bidAmount);
      expect(spyAddBid).toHaveBeenCalled();
    });

    it('should place a new bid', async () => {
      component.userBid = mockedBid.bidAmount;
      component.maxBid = { bidAmount: 15, userId: { username: 'testuser' } };
      const spyAddBid = auctionServiceMock.addBid.and.returnValue(of(mockedNftAuctionResponse.auction));

      await component.placeBid();

      expect(component.maxBid).toEqual(mockedBid.bidAmount);
      expect(spyAddBid).toHaveBeenCalled();
    });
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
    component.specificOffer = mockOffer;

    component.addToCart();

    expect(cartServiceMock.addItemToCart).toHaveBeenCalled();
    expect(routerMock.navigateByUrl).toHaveBeenCalledWith('/cart');
  });

  it('should get the count down config', () => {
    const response = component.countDownConfig.formatDate({ date: new Date().getTime(), formatStr: 'hh:mm:ss' });

    expect(response).toBeTruthy();
  });
});
