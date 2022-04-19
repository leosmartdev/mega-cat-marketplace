import { ComponentFixture, TestBed } from '@angular/core/testing';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { PayoutsStatusComponent } from './payouts-status.component';
import { AngularFireAuthModule } from '@angular/fire/compat/auth';
import { AngularFireModule } from '@angular/fire/compat';
import { environment } from 'environments/environment';
import { RouterTestingModule } from '@angular/router/testing';
import { ErrorsService } from '../../../../core/errors/errors.service';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { ReactiveFormsModule } from '@angular/forms';
import { AuthService } from 'app/core/auth/auth.service';
import { of, throwError } from 'rxjs';
import { RolesService } from 'app/core/roles/roles.service';
import { WalletService } from 'app/core/wallet/wallet.service';
import { mockedOfferResponse } from 'app/core/auction/spec-files/mocked';
import { NgxPaginationModule } from 'ngx-pagination';
describe('PayoutsStatusComponent', () => {
  let component: PayoutsStatusComponent;
  let fixture: ComponentFixture<PayoutsStatusComponent>;

  const authServiceMock = jasmine.createSpyObj('AuthService', ['isAdmin']);
  authServiceMock.isAdmin.and.returnValue(of(false));
  const rolesServiceMock = jasmine.createSpyObj('RolesService', ['getPayoutsByWalletAddress', 'transferBalanceToUserMetamaskWallet', 'getUserBalanceByWalletAddress']);
  const walletServiceMock = jasmine.createSpyObj('WalletService', ['getAccounts']);
  const errorsServiceMock = jasmine.createSpyObj('ErrorsService', ['openSnackBar']);

  walletServiceMock.getAccounts.and.returnValue(of([]));
  rolesServiceMock.getPayoutsByWalletAddress.and.returnValue(of({}));
  rolesServiceMock.transferBalanceToUserMetamaskWallet.and.returnValue(of({}));
  rolesServiceMock.getUserBalanceByWalletAddress.and.returnValue(of({}));

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [PayoutsStatusComponent],
      imports: [
        HttpClientTestingModule,
        AngularFireModule.initializeApp(environment.firebase),
        AngularFireAuthModule,
        RouterTestingModule,
        MatSnackBarModule,
        ReactiveFormsModule,
        NgxPaginationModule
      ],
      providers: [
        { provide: AuthService, useValue: authServiceMock },
        { provide: ErrorsService, useValue: errorsServiceMock },
        MatSnackBar,
        { provide: RolesService, useValue: rolesServiceMock },
        { provide: WalletService, useValue: walletServiceMock }
      ]
    }).compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(PayoutsStatusComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should respond with an error if getting user balance failed', () => {
    rolesServiceMock.getUserBalanceByWalletAddress.and.returnValue(throwError('Some Error!'));

    component.getUserBalance();

    expect(errorsServiceMock.openSnackBar).toHaveBeenCalledWith('Something went wrong!', 'Error');
  });

  describe('SetWalletAddress', () => {
    beforeEach(() => {
      component.nfts = [];
      component.filteredNFTs = [];
    });

    it('should show an error if it fails to get payouts', () => {
      rolesServiceMock.getPayoutsByWalletAddress.and.returnValue(throwError('Failed to get payouts'));
      walletServiceMock.getAccounts.and.returnValue(of(['xyz']));

      component.setWalletAddress();

      expect(errorsServiceMock.openSnackBar).toHaveBeenCalledWith('Something went wrong!', 'Error');
    });

    it('should successfully get payouts and filter nfts', () => {
      walletServiceMock.getAccounts.and.returnValue(of(['xyz']));
      rolesServiceMock.getPayoutsByWalletAddress.and.returnValue(of({ payouts: [mockedOfferResponse] }));

      component.setWalletAddress();

      expect(component.filteredNFTs).toEqual([mockedOfferResponse]);
    });

    it('should set nfts to an empty array if no payout is received', () => {
      walletServiceMock.getAccounts.and.returnValue(of(['xyz']));
      rolesServiceMock.getPayoutsByWalletAddress.and.returnValue(of({}));
      component.setWalletAddress();

      expect(component.nfts).toEqual([]);
    });
  });

  describe('TransferUserBalanceToWallet', () => {
    it('should return if there is no balance to withdraw', () => {
      component.balance = '0.00';

      component.transferUserBalanceToWallet();

      expect(errorsServiceMock.openSnackBar).toHaveBeenCalledWith('Balance is not enough to withdraw!', '');
    });

    it('should transfer balance to users metamask wallet', () => {
      component.balance = '100';
      const data = {
        message: 'Amount transferred successfully',
        amount: 100
      };
      rolesServiceMock.transferBalanceToUserMetamaskWallet.and.returnValue(of(data));

      component.transferUserBalanceToWallet();

      expect(errorsServiceMock.openSnackBar).toHaveBeenCalledWith('Transferred successfully!', 'Success');
      expect(component.balance).toEqual('0.00');
    });

    it('should respond with an error if tranferring balance fails', () => {
      component.balance = '100';
      rolesServiceMock.transferBalanceToUserMetamaskWallet.and.returnValue(throwError('Some Error!'));

      component.transferUserBalanceToWallet();

      expect(errorsServiceMock.openSnackBar).toHaveBeenCalledWith('Something went wrong!', 'Error');
    });
  });
});
