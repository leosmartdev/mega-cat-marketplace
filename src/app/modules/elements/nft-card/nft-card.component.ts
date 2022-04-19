import { NftUtilsService } from './../../../shared/nft-utils.service';
import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
import { ProductService } from 'app/core/product/product.service';
import { VenlyService } from 'app/core/venly/venly.service';
import { ErrorsService } from 'app/core/errors/errors.service';
import { CartService } from 'app/core/cart/cart.service';
import { WizardDialogService } from 'app/shared/wizard-dialog-service/wizard-dialog.service';
import { WizardStage } from 'app/shared/wizard-dialog-service/wizard-stage.model';
import { Router } from '@angular/router';
import { NftCardModel } from 'app/core/models/nft-card.model';
import { CartItem } from 'app/core/cart/cartItem';
import { WalletService } from 'app/core/wallet/wallet.service';
import { AuctionService } from 'app/core/auction/auction.service';
import { CountdownConfig } from 'ngx-countdown';
import moment from 'moment';
import { AuthService } from 'app/core/auth/auth.service';
import { User } from 'app/core/user/user.types';
import { AuctionStates } from 'app/core/auction/auction';
import Swal from 'sweetalert2';

enum ListingAction {
  NONE = 'none',
  SALE = 'sale',
  AUCTION = 'auction'
}

const CountdownTimeUnits: Array<[string, number]> = [
  ['Y', 1000 * 60 * 60 * 24 * 365], // years
  ['M', 1000 * 60 * 60 * 24 * 30], // months
  ['D', 1000 * 60 * 60 * 24], // days
  ['H', 1000 * 60 * 60], // hours
  ['m', 1000 * 60], // minutes
  ['s', 1000], // seconds
  ['S', 1] // million seconds
];

@Component({
  selector: 'app-nft-card',
  templateUrl: './nft-card.component.html',
  styleUrls: ['./nft-card.component.scss']
})
export class NftCardComponent implements OnInit {
  @Input() nft: NftCardModel;
  // eslint-disable-next-line @angular-eslint/no-input-rename
  @Input('auction-id') auctionId?: string;
  @Output() loading = new EventEmitter();
  AuctionStates = AuctionStates;

  contractAddressUrl;
  listingPrice;
  ListingActionType = ListingAction;
  listingAction: ListingAction = ListingAction.NONE;
  startingBid: number = 0;
  startingBidValidation: boolean = false;
  expirationDateTime: string;
  expirationTimeValidation: boolean = false;
  leftTimeOnAuction: number;
  user: User;

  countDownConfig: CountdownConfig = {
    leftTime: 60 * 60 * 25, // dummy time
    formatDate: ({ date, formatStr }) => {
      let duration = Number(date || 0);

      return CountdownTimeUnits.reduce((current, [name, unit]) => {
        if (current.indexOf(name) !== -1) {
          const v = Math.floor(duration / unit);
          duration -= v * unit;
          return current.replace(new RegExp(`${name}+`, 'g'), (match: string) => v.toString().padStart(match.length, '0'));
        }
        return current;
      }, formatStr);
    }
  };

  constructor(
    private productService: ProductService,
    private auctionService: AuctionService,
    private errorsService: ErrorsService,
    private venlyService: VenlyService,
    private cartService: CartService,
    private wizardService: WizardDialogService,
    private router: Router,
    private nftUtilsService: NftUtilsService,
    public walletService: WalletService,
    private authService: AuthService
  ) {
    const tzoffset = new Date().getTimezoneOffset() * 60000; //offset in milliseconds
    const localISOTime = new Date(Date.now() - tzoffset).toISOString().slice(0, 16);

    this.expirationDateTime = localISOTime;
  }

  ngOnInit(): void {
    this.contractAddressUrl = `${this.getChainUrl()}/${this.nft.contract.address}`;
    this.user = this.authService.user;

    if (this.nft.marketplace.type === 'listing-auction') {
      const leftTimeOnAuction = Math.round((new Date(this.nft.auction.expirationTime).getTime() - new Date().getTime()) / 1000);
      this.countDownConfig.leftTime = leftTimeOnAuction;
    }
  }

  openNft() {
    const tokenId = this.nft.tokenId;
    const contractAddress = this.nft.contract.address;

    const nftUrl = `nft/${contractAddress}/${tokenId}`;
    const queryParams = this.nft.marketplace.type === 'listing-auction' ? { auction: this.auctionId } : {};

    this.router.navigate([nftUrl], { queryParams });
  }

  toggleSaleDrawer() {
    this.listingAction = ListingAction.SALE;
  }

  toggleAuctionDrawer() {
    this.listingAction = ListingAction.AUCTION;
  }

  async listForSale(auction: boolean = false) {
    // TODO: Configure for mainnet vs. testnet for default fallback
    const chain = this.nft.chain ?? 'mumbai';
    const { status: isSwitched } = await this.walletService.requireChain(chain);

    if (!isSwitched) {
      Swal.fire({
        icon: 'info',
        title: `<p class='text-white'>Please switch MetaMask to ${chain} network to proceed!</p>`,
        background: '#5b5353',
        iconColor: 'white'
      });
      return;
    }

    if (auction) {
      // perform input validations
      this.startingBidValidation = this.startingBid < 10 || this.startingBid > 10000;
      const hourdiff = moment().diff(new Date(this.expirationDateTime), 'hours') * -1;
      const daydiff = moment().diff(new Date(this.expirationDateTime), 'days') * -1;

      this.expirationTimeValidation = hourdiff < 1 || daydiff > 30;

      if (this.startingBidValidation || this.expirationTimeValidation) {
        return;
      }
      this.listingPrice = this.startingBid;
    }

    const formdata = new FormData();
    const self = this;
    formdata.append('tokenId', this.nft.tokenId);
    formdata.append('address', this.nft.contract.address);
    formdata.append('sellerAddress', this.walletService.getConnectedWallet());
    formdata.append('price', this.listingPrice);

    this.showWizardDialog();

    this.productService.createForSale(formdata).subscribe(
      async (response) => {
        this.wizardService.advanceStages();
        const offerId = response.data.offerId;
        if (response.data.transaction) {
          if (response.data.transaction.signableMessages) {
            try {
              const nftContractAddress = this.nft.contract.address;
              await self.venlyService.updateOfferWithApproval(nftContractAddress, response.data);
            } catch (error) {
              this.wizardService.failStage(error);
              self.errorsService.openSnackBar('User Cancel Listing Process!', 'Error');
              return;
            }
          } else if (response.data.transaction.approvalPreparationTransactions) {
            try {
              const nftContractAddress = this.nft.contract.address;
              await self.venlyService.updateOfferWithApproval(nftContractAddress, response.data);
            } catch (error) {
              this.wizardService.failStage(error);
              self.errorsService.openSnackBar('User Cancel Listing Process!', 'Error');
              return;
            }
          }
        }

        this.wizardService.advanceStages();
        try {
          await self.venlyService.updateOfferWithSignature(offerId);
        } catch (error) {
          this.wizardService.failStage(error);
          self.errorsService.openSnackBar('User Cancel Listing Process!', 'Error');
          return;
        }
        if (auction) {
          const expirationTime = new Date(this.expirationDateTime).getTime();
          // register new auction
          this.auctionService
            .create({
              offerId,
              expirationTime,
              startingBid: this.startingBid
            })
            .subscribe((_response) => {
              this.wizardService.advanceStages();
              this.nft.marketplace.type = 'listing-pending';
            });
        } else {
          this.wizardService.advanceStages();
          this.nft.marketplace.type = 'listing-pending';
        }
      },
      (error) => {
        this.wizardService.failStage(error);
        self.errorsService.openSnackBar('Something went wrong!', 'Error');
      }
    );

    this.listingAction = ListingAction.NONE;
  }

  imageError() {
    this.nft.image = this.nftUtilsService.getFallbackImage();
  }

  timer(value: number) {
    const hours: number = Math.floor(value / 3600);
    const minutes: number = Math.floor((value % 3600) / 60);
    return ('00' + hours).slice(-2) + ':' + ('00' + minutes).slice(-2) + ':' + ('00' + Math.floor(value - minutes * 60)).slice(-2);
  }

  addToCart() {
    const item: CartItem = {
      _id: this.nft.listing.id,
      collection: this.nft.contract.address,
      count: 1,
      image: this.nft.image,
      name: this.nft.name,
      price: this.nft.listing.price,
      sellerAddress: this.nft.listing.sellerAddress,
      subTotal: this.nft.listing.price,
      tokenId: this.nft.tokenId
    };

    this.cartService.addItemToCart(item);
  }

  getChainUrl() {
    // TODO: Change this based on chain and staging.
    return 'https://mumbai.polygonscan.com/address';
  }

  private showWizardDialog() {
    const stages: WizardStage[] = [
      {
        name: 'Setup',
        status: 'dormant',
        description: 'Creating the listing.'
      },
      {
        name: 'Approve',
        status: 'dormant',
        description: 'Approve our marketplace to take custody of the NFT.'
      },
      {
        name: 'Agree',
        status: 'dormant',
        description: 'Sign the message with your wallet to agree to our Terms & Conditions'
      }
    ];

    this.wizardService.showWizard('List Your NFT', stages, true);
  }
}
