import { Component, OnInit, NgZone } from '@angular/core';
import { AuthService } from 'app/core/auth/auth.service';
import { User } from '../../../core/user/user.types';
import { WalletService } from '../../../core/wallet/wallet.service';
import { ProductService } from 'app/core/product/product.service';
import { ErrorsService } from 'app/core/errors/errors.service';
import { Offer } from 'app/core/models/offer.model';
import { SharedService } from 'app/core/shared/shared.service';
import { Router } from '@angular/router';
import { NftUtilsService } from 'app/shared/nft-utils.service';
import { NftCardModel } from 'app/core/models/nft-card.model';
import { VenlyWalletNft } from 'app/core/models/venly/venly-wallet-nft.model';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';

interface NftAuctionModel {
  nft: NftCardModel;
  auction?: any;
}

@Component({
  selector: 'app-profile',
  templateUrl: './profile.component.html',
  styleUrls: ['./profile.component.scss']
})
export class ProfileComponent implements OnInit {
  user: User;
  walletAddress: string;
  linkedWalletAddresses: string[] = [];
  walletAddressFilter: any = 'all';
  term: string = '';
  isAdmin: boolean = false;
  loading: boolean = false;
  numbers: number[];
  filteredNFTs: NftAuctionModel[] = [];
  isFetching: boolean = true;
  nfts: NftAuctionModel[] = [];
  selectedOption: string = 'Filter List';
  isSelecting: boolean = false;
  isUserAuctions: boolean = false;
  isParticipatedAuctions: boolean = false;
  userAuctionNfts = [];
  ParticipatedAuctionNfts = [];
  avatar: string = null;
  banner: string = null;
  updateAvatarForm: FormGroup;
  collectionsNFTs = new Map();
  collectionsNFTKeys: any = [];
  selectedTab: number = 0;
  activePanel: string = '';
  public url: string = '';

  constructor(
    private authService: AuthService,
    public walletService: WalletService,
    private ngZone: NgZone,
    private productService: ProductService,
    private errorsService: ErrorsService,
    private sharedService: SharedService,
    private router: Router,
    private nftUtilsService: NftUtilsService,
    private _formBuilder: FormBuilder
  ) {
    this.numbers = Array(10)
      .fill(0)
      .map((x, i) => i);
    this.sharedService.url.subscribe((value) => (this.url = value));
  }

  ngOnInit(): void {
    this.sharedService.url.next(this.router.url);
    this.user = this.authService.user;
    this.linkedWalletAddresses = this.user?.linkedWalletAddresses;
    this.setWalletAddress();
    this.isAdmin = this.authService.isAdmin();
    this.setAvatar();
    this.setBanner();
    this.updateAvatarForm = this._formBuilder.group({
      image: ['', Validators.required]
    });
  }

  getPendingOffers() {
    this.productService.getAllListings('AWAITING_FINALIZING_OFFER,FINALIZING_OFFER').subscribe(
      (data: { data: Offer[] }) => {
        const distinctCollections = [];
        const pendingListings = data.data.filter((listing: Offer) => listing.buyerWalletAddress === this.walletAddress || listing.externalBuyerId === this.user.id);

        pendingListings.forEach((offer: Offer) => {
          const nftCard = this.nftUtilsService.buildNftCardFromVenlyOffer({ offer, marketplaceType: 'owned-pending' });

          if (distinctCollections.indexOf(offer.nft.contract.address) === -1) {
            distinctCollections.push(offer.nft.contract.address);
          }

          this.nfts.push({ nft: nftCard });
        });
      },
      (error) => {
        console.error('Error fetching pending listings for user', error);
      }
    );
  }

  getNFTsForWallet(): void {
    let pendingOffersForUser: any = [];
    this.isFetching = true;
    this.filteredNFTs = [];
    this.productService.getAllListings('INITIATING_OFFER', true).subscribe((list) => {
      pendingOffersForUser = list.data.filter((listing: Offer) => listing.sellerAddress === this.walletAddress);

      // filtering-out offers against old NFTs, having not enough data in them
      pendingOffersForUser = pendingOffersForUser.filter(
        (listing: Offer) => listing.nft.contract.media !== null && listing.nft.contract.media.find((x) => x.type === 'collectionId') !== undefined
      );

      let listingNFTObservable;
      const linkedWallets = this.linkedWalletAddresses;
      const noLinkedWallets = !Boolean(linkedWallets) || linkedWallets.length === 0;
      if (noLinkedWallets || this.walletAddressFilter !== 'all') {
        this.nfts = [];
        const walletAddress = noLinkedWallets ? this.walletAddress : this.walletAddressFilter.walletAddress;
        listingNFTObservable = this.productService.listingNFTByWallet(walletAddress);
      } else {
        listingNFTObservable = this.productService.listingNFTByLinkedWallets();
      }

      listingNFTObservable.subscribe(
        (data) => {
          if (Boolean(data.data) === false) {
            this.nfts = [];
            this.filteredNFTs = this.nfts;
            this.isFetching = false;
            return;
          }
          data.data.forEach((nft: VenlyWalletNft) => {
            const nftCard = this.nftUtilsService.buildNftCardFromVenlyWalletNft(nft);
            if (
              !pendingOffersForUser.some((listing) => listing.nft.id === nftCard.tokenId && listing.nft.contract.address === nftCard.contract.address) &&
              !this.nfts.some((listing) => listing.nft.tokenId === nftCard.tokenId && listing.nft.contract.address === nftCard.contract.address)
            ) {
              this.nfts.push({ nft: nftCard });
            }
          });
          this.filteredNFTs = this.nfts;
          console.log(this.filteredNFTs);

          pendingOffersForUser.forEach((offer) => {
            const nft = this.nftUtilsService.buildNftCardFromVenlyOffer({ offer, marketplaceType: 'listing-pending' });
            this.filteredNFTs.push({ nft });
          });

          this.nfts.forEach((nt) => {
            if (this.collectionsNFTs.has(nt.nft.contract.address)) {
              this.collectionsNFTs.get(nt.nft.contract.address).push(nt);
            } else {
              this.collectionsNFTs.set(nt.nft.contract.address, [nt]);
            }
          });

          this.activePanel = this.collectionsNFTs.keys().next().value;
          this.collectionsNFTKeys = Array.from(this.collectionsNFTs.keys());

          this.isFetching = false;
        },
        (error) => {
          this.errorsService.openSnackBar('Something went wrong!', 'Error: ' + error.message);
        }
      );
    });
  }

  setWalletAddress() {
    this.walletService.getAccounts().subscribe((accounts) => {
      this.ngZone.run(() => {
        if (accounts.length === 0) {
          // This should be unreachable code (route should be guarded by wallet)
          this.walletAddress = null;
        } else {
          this.walletAddress = accounts[0];
          this.getNFTsForWallet();
          this.getPendingOffers();
        }
      });
    });
  }

  setAvatar() {
    console.log(this.user);
    if (this.user && this.user.avatar) {
      this.avatar = this.user.avatar;
    } else {
      this.avatar = 'https://cdn.shopify.com/s/files/1/1494/4102/t/7/assets/pf-5005c27f--IWantYouUncleSam4.png?v=1593416331';
    }
  }

  setBanner() {
    if (this.user && this.user.banner) {
      this.banner = this.user.banner;
    } else {
      this.banner = '';
    }
  }

  onChangeAvatar(event) {
    this.updateAvatarForm.controls['image'].setValue(event.target.files[0]);
    this.setProfileImage(event);
    this.updateAvatar();
  }

  updateAvatar(): void {
    if (this.updateAvatarForm.value.image) {
      const formData = new FormData();
      formData.append('avatar', this.updateAvatarForm.value.image);
      this.authService.updateAvatar(formData).subscribe();
      this.avatar = this.user.avatar;
    }
  }

  getUser(): User {
    return this.authService.user;
  }

  changeTab(value: number) {
    this.selectedTab = value;
  }

  openPanel(name: string) {
    if (this.activePanel === '' || this.activePanel !== name) {
      this.activePanel = name;
    } else {
      this.activePanel = '';
    }
  }

  filterWalletAddress(walletAddress) {
    this.filterWalletAddress = walletAddress;
  }

  private setProfileImage(changeEvent) {
    const reader = new FileReader();
    reader.onload = (event: any) => {
      this.avatar = event.target.result;
    };

    reader.onerror = (event: any) => {
      console.log(`File could not be read: ${event.target.error.code}`);
    };

    reader.readAsDataURL(changeEvent.target.files[0]);
  }
}
