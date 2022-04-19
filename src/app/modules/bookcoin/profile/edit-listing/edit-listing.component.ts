import { Component, OnInit, NgZone } from '@angular/core';
import { AuthService } from 'app/core/auth/auth.service';
import { User } from '../../../../core/user/user.types';
import { WalletService } from '../../../../core/wallet/wallet.service';
import { ErrorsService } from 'app/core/errors/errors.service';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { RolesService } from 'app/core/roles/roles.service';
import { ProductService } from 'app/core/product/product.service';

@Component({
  selector: 'app-edit-listing',
  templateUrl: './edit-listing.component.html',
  styleUrls: ['./edit-listing.component.scss']
})
export class EditListingComponent implements OnInit {
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
  isFetching: boolean = true;

  loading: boolean = false;
  constructor(
    private authService: AuthService,
    public walletService: WalletService,
    private ngZone: NgZone,
    private errorsService: ErrorsService,
    private _formBuilder: FormBuilder,
    private roleService: RolesService,
    private productService: ProductService
  ) {}

  ngOnInit(): void {
    this.user = this.authService.user;
    // Set profile info on init
    this.setAvatar();
    this.setWalletAddress();
    this.updateAvatarForm = this._formBuilder.group({
      image: ['', Validators.required]
    });

    this.isAdmin = this.authService.isAdmin();
  }

  setAvatar() {
    if (this.user && this.user.avatar) {
      this.avatar = this.user.avatar;
    } else {
      this.avatar = this.authService.getDefaultAvatar();
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
        this.getNFTs();
      });
      console.log(this.nfts.length);
    });
  }

  getNFTs() {
    this.isFetching = true;
    const filter = 'READY,INITIATING_OFFER';
    this.productService.getAllListings(filter).subscribe(
      (data) => {
        this.nfts = data.data.filter((nft) => nft.sellerAddress === this.walletAddress);
        this.isFetching = false;
      },
      () => {
        this.errorsService.openSnackBar('Something went wrong!', 'Error');
      }
    );
  }

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
