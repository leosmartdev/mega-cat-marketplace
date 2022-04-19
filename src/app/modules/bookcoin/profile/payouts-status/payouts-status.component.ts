import { Component, OnInit, NgZone } from '@angular/core';
import { AuthService } from 'app/core/auth/auth.service';
import { User } from '../../../../core/user/user.types';
import { WalletService } from '../../../../core/wallet/wallet.service';
import { ErrorsService } from 'app/core/errors/errors.service';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { RolesService } from 'app/core/roles/roles.service';

@Component({
  selector: 'app-payouts-status',
  templateUrl: './payouts-status.component.html',
  styleUrls: ['./payouts-status.component.scss']
})
export class PayoutsStatusComponent implements OnInit {
  walletAddress: string;
  mockdata: any = [];
  nfts: any[] = [];
  filteredNFTs: any[] = [];
  loading: boolean = false;
  displayedColumns: string[] = ['name', 'collection', 'status', 'price'];
  page: number = 1;
  balance: string = '0.00';
  isAdmin: boolean = false;

  constructor(
    public walletService: WalletService,
    private ngZone: NgZone,
    private errorsService: ErrorsService,
    private roleService: RolesService,
    private authService: AuthService
  ) {}

  ngOnInit(): void {
    this.setWalletAddress();
    this.getUserBalance();
    this.isAdmin = this.authService.isAdmin();
  }

  setWalletAddress() {
    this.walletService.getAccounts().subscribe((accounts) => {
      this.ngZone.run(() => {
        if (accounts.length === 0) {
          this.walletAddress = null;
        } else {
          this.walletAddress = accounts[0];
        }

        this.roleService
          .getPayoutsByWalletAddress({
            walletAddress: this.walletAddress
          })
          .subscribe(
            (data) => {
              // this.balance = data.balance;
              if (Boolean(data.payouts) === false) {
                this.nfts = [];
                return;
              }
              data.payouts.forEach((nft: any) => {
                this.nfts.push(nft);
              });
              this.filteredNFTs = this.nfts;
            },
            () => {
              this.errorsService.openSnackBar('Something went wrong!', 'Error');
            }
          );
      });
    });
  }

  getUserBalance() {
    this.roleService.getUserBalanceByWalletAddress().subscribe(
      (data) => {
        if (data.balance !== null) {
          this.balance = data.balance;
        }
      },
      () => {
        this.errorsService.openSnackBar('Something went wrong!', 'Error');
      }
    );
  }

  transferUserBalanceToWallet() {
    if (this.balance === '0.00') {
      this.errorsService.openSnackBar('Balance is not enough to withdraw!', '');
      return;
    }
    this.roleService
      .transferBalanceToUserMetamaskWallet({
        walletAddress: this.walletAddress,
        amount: this.balance
      })
      .subscribe(
        (data) => {
          this.balance = '0.00';
          this.errorsService.openSnackBar('Transferred successfully!', 'Success');
        },
        () => {
          this.errorsService.openSnackBar('Something went wrong!', 'Error');
        }
      );
  }

  getNFTs(): void {}
}
