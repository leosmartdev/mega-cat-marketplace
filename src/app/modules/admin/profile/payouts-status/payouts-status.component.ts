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
  user: User;
  avatar: string = null;
  walletAddress: string;
  mockdata: any = [];
  nfts: any[] = [];
  filteredNFTs: any[] = [];
  activeNft: string = '';
  term: string = '';
  updateAvatarForm: FormGroup;
  isAdmin: boolean = false;
  loading: boolean = false;
  displayedColumns: string[] = ['name', 'collection', 'status', 'price'];
  page: number = 1;
  balance: string = '0.00';

  constructor(
    private authService: AuthService,
    public walletService: WalletService,
    private ngZone: NgZone,
    private errorsService: ErrorsService,
    private _formBuilder: FormBuilder,
    private roleService: RolesService
  ) {}

  ngOnInit(): void {
    this.user = this.authService.user;
    // Set profile info on init
    this.setAvatar();
    this.setWalletAddress();
    this.getUserBalance();
    this.updateAvatarForm = this._formBuilder.group({
      image: ['', Validators.required]
    });

    this.isAdmin = this.authService.isAdmin();

    this.getNFTs();
  }

  setAvatar() {
    if (this.user && this.user.avatar) {
      this.avatar = this.user.avatar;
    } else {
      this.avatar = 'https://cdn.shopify.com/s/files/1/1494/4102/t/7/assets/pf-5005c27f--IWantYouUncleSam4.png?v=1593416331';
    }
  }

  setWalletAddress() {
    this.walletService.getAccounts().subscribe((accounts) => {
      this.ngZone.run(() => {
        if (accounts.length === 0) {
          this.walletAddress = null;
        } else {
          this.walletAddress = accounts[0];
        }
        console.log('wallet addresss issss:' + this.walletAddress);
        this.roleService
          .getPayoutsByWalletAddress({
            walletAddress: this.walletAddress
          })
          .subscribe(
            (data) => {
              console.log(data);
              if (Boolean(data.payouts) === false) {
                this.nfts = [];
                return;
              }
              data.payouts.forEach((nft: any) => {
                console.log('pushing nft:' + nft);
                this.nfts.push(nft);
              });
              this.filteredNFTs = this.nfts;
            },
            () => {
              this.errorsService.openSnackBar('Something went wrong!', 'Error');
            }
          );
      });
      console.log(this.nfts.length);
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
          console.log('response', data);
          this.balance = '0.00';
          this.errorsService.openSnackBar('Transferred successfully!', 'Success');
        },
        () => {
          this.errorsService.openSnackBar('Something went wrong!', 'Error');
        }
      );
  }

  getNFTs(): void {}

  search() {
    console.log(this.term);
    this.filteredNFTs = this.nfts.filter((o) => o.metadata.name.toLowerCase().includes(this.term.toLowerCase()));
    console.log(this.filteredNFTs);
  }

  openNft(nft) {
    console.log(nft);
  }

  loader(e) {
    this.loading = e;
  }
}
