import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ErrorsService } from 'app/core/errors/errors.service';
import { WalletService } from 'app/core/wallet/wallet.service';

import { WalletComponent } from './wallet.component';

describe('WalletComponent', () => {
  let component: WalletComponent;
  let fixture: ComponentFixture<WalletComponent>;
  const walletServiceMock = jasmine.createSpyObj('WalletService', ['isWalletActive', 'connectToMetaMask']);
  const errorServiceMock = jasmine.createSpyObj('ErrorService', ['openSnackBar']);

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [WalletComponent],
      providers: [
        { provide: WalletService, useValue: walletServiceMock },
        { provide: ErrorsService, useValue: errorServiceMock }
      ]
    }).compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(WalletComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  describe('showMore', () => {
    it('should show the coming soon option', () => {
      component.isShowingMore = false;

      component.showMore();

      expect(component.optionLabel).toEqual((component as any).lessLabel);
    });

    it('should hide the coming soon option', () => {
      component.isShowingMore = true;

      component.showMore();

      expect(component.optionLabel).toEqual((component as any).moreLabel);
    });
  });

  describe('connectToWallet', () => {
    it('should respond with snackBar if wallet is already connected', () => {
      walletServiceMock.isWalletActive.and.returnValue(true);

      component.connectToWallet('metamask');

      expect(errorServiceMock.openSnackBar).toHaveBeenCalledWith('Metamask wallet is already logged in.', 'Okay');
    });

    it('should connect to metamask if wallet is not connected', () => {
      walletServiceMock.isWalletActive.and.returnValue(false);

      component.connectToWallet('metamask');

      expect(walletServiceMock.connectToMetaMask).toHaveBeenCalled();
    });
  });
});
