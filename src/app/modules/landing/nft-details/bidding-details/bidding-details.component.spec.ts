import { HttpClientTestingModule } from '@angular/common/http/testing';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { Router } from '@angular/router';
import { AuctionService } from 'app/core/auction/auction.service';
import { mockedBid, mockedExpiredAuction, mockedNftAuctionResponse, mockUser } from 'app/core/auction/spec-files/mocked';
import { AuthService } from 'app/core/auth/auth.service';
import { WalletService } from 'app/core/wallet/wallet.service';
import { WizardDialogService } from 'app/shared/wizard-dialog-service/wizard-dialog.service';
import { of } from 'rxjs';
import Swal from 'sweetalert2';

import { BiddingDetailsComponent } from './bidding-details.component';

describe('BiddingDetailsComponent', () => {
  let component: BiddingDetailsComponent;
  let fixture: ComponentFixture<BiddingDetailsComponent>;
  const authServiceMock = jasmine.createSpyObj('AuthService', ['user'], ['get']);
  const routerMock = jasmine.createSpyObj('Router', ['navigate']);
  const auctionServiceMock = jasmine.createSpyObj('AuctionService', ['getOne', 'setupSocketConnection', 'addBid', 'disconnectSocket']);
  const walletServiceMock = jasmine.createSpyObj('WalletService', ['isWalletActive', 'getBalance']);
  const wizardServiceMock = jasmine.createSpyObj('WizardDialogService', ['advanceStages', 'showWizard', 'setError', 'failStage', 'close']);

  auctionServiceMock.getOne.and.returnValue(of(mockedNftAuctionResponse));
  auctionServiceMock.setupSocketConnection.and.returnValue({ observableNewBid: of(mockedBid), observableExpireAuction: of(mockedExpiredAuction) });
  authServiceMock.user.and.returnValue(mockUser);

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [BiddingDetailsComponent],
      imports: [HttpClientTestingModule, BrowserAnimationsModule],
      providers: [
        { provide: AuthService, useValue: authServiceMock },
        { provide: Router, useValue: routerMock },
        { provide: WizardDialogService, useValue: wizardServiceMock },
        { provide: AuctionService, useValue: auctionServiceMock },
        { provide: WalletService, useValue: walletServiceMock }
      ]
    }).compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(BiddingDetailsComponent);
    component = fixture.componentInstance;
    component.auctionId = '1';
    fixture.detectChanges();
    walletServiceMock.isWalletActive.and.returnValue(true);
    walletServiceMock.getBalance.and.returnValue(Promise.resolve('100'));
  });

  afterAll(() => {
    component.OnDestroy();
    fixture.destroy();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
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
      component.user = mockUser;
      component.maxBid = { bidAmount: 15, userId: { username: 'testuser' } };
      const spyAddBid = auctionServiceMock.addBid.and.returnValue(of(mockedNftAuctionResponse.auction));

      await component.placeBid();
      expect(spyAddBid).toHaveBeenCalled();
    });
  });

  it('should emit an offer', () => {
    const spyAddToCart = spyOn(component.addToCart, 'emit');

    component.preProcessAddToCart();
    expect(spyAddToCart).toHaveBeenCalledWith(mockedNftAuctionResponse.offer);
  });

  it('should get the count down config', () => {
    const response = component.countDownConfig.formatDate({ date: new Date().getTime(), formatStr: 'hh:mm:ss' });

    expect(response).toBeTruthy();
  });
});
