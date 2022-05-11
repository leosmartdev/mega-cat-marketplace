import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { AuctionBid, AuctionOfferResponse, AuctionResponse, AuctionStates } from 'app/core/auction/auction';
import { AuctionService } from 'app/core/auction/auction.service';
import { AuthService } from 'app/core/auth/auth.service';
import { User } from 'app/core/user/user.types';
import { WalletService } from 'app/core/wallet/wallet.service';
import { CountdownConfig } from 'ngx-countdown';
import Swal from 'sweetalert2';
import { ActivatedRoute, Router } from '@angular/router';
import { ProductService } from 'app/core/product/product.service';
import { SharedService } from 'app/core/shared/shared.service';
import { CartService } from 'app/core/cart/cart.service';
import { WizardStage } from 'app/shared/wizard-dialog-service/wizard-stage.model';
import { WizardDialogService } from 'app/shared/wizard-dialog-service/wizard-dialog.service';

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
  selector: 'app-auction-detail',
  templateUrl: './auction-detail.component.html',
  styleUrls: ['./auction-detail.component.scss']
})
export class AuctionDetailComponent implements OnInit {
  auctionId: string;
  user: User;
  AuctionStatesType = AuctionStates;
  auction: AuctionResponse;
  offer: AuctionOfferResponse | undefined = null;
  userBid: number = null;
  bids: AuctionBid[] = [];
  bid;
  maxBid = null;
  bidValidation: boolean = false;
  balance: number;
  balanceValidation: boolean = false;
  connectWalletValidation: boolean = false;
  activePanel: string = 'story';
  activePanel2: string = 'buy-now';
  activePanel3: string = '';
  id: string;
  specificOffer: any;
  attributes: any[];
  listingId: string;
  username: any;
  bio: any;
  avatar: any = '../../../../assets/images/avatars/brian-hughes.jpg';
  displayedColumns: string[] = ['user', 'bid', 'date'];
  page: number = 1;
  story: any = '';
  perks: any = '';
  faqs: any = '';
  tos: any = '';
  defaultStory: any = 'no story available';
  defaultPerks: any = 'no perks available';
  defaultFaqs: any = 'no faqs available';
  defaultTos: any = 'no terms of services available';

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
    private auctionService: AuctionService,
    private router: Router,
    private sharedService: SharedService,
    private route: ActivatedRoute,
    private activatedRoute: ActivatedRoute,
    private productService: ProductService,
    private cartService: CartService,
    private authService: AuthService,
    private walletService: WalletService,
    private wizardService: WizardDialogService
  ) {}

  ngOnInit(): void {
    this.auctionId = this.route.snapshot.params['auctionId'];
    this.sharedService.url.next(this.router.url);
    this.listingId = this.activatedRoute.snapshot.params['listingId'];
    this.user = this.authService.user;
    this.productService.specificOffer(this.listingId).subscribe((data) => {
      this.specificOffer = data.data;
      const nftStory = this.specificOffer.nft.attributes?.find((x) => x.name === 'story');
      if (nftStory !== undefined && nftStory !== '' && nftStory !== null) {
        this.story = nftStory;
      } else {
        this.story = this.specificOffer.nft.contract.media?.find((x) => x.type === 'story');
      }

      this.perks = this.specificOffer.nft.attributes.find((x) => x.name === 'perks');
      this.faqs = this.specificOffer.nft.attributes.find((x) => x.name === 'faqs');
      this.tos = this.specificOffer.nft.attributes.find((x) => x.name === 'tos');
      const attributes = [];
      this.specificOffer.nft.attributes.map((attr) => {
        if (attr.name !== 'story' && attr.name !== 'perks' && attr.name !== 'faqs' && attr.name !== 'tos') {
          attributes.push(attr);
        }
      });
      this.attributes = attributes;
      const smartContractAddress = this.specificOffer.nft.contract.address;
      this.productService.getUserOfCollection(smartContractAddress).subscribe((res) => {
        this.username = res.data.username;
        this.bio = res.data.bio;
        this.avatar = res.avatar;
      });
    });

    if (this.auctionId) {
      this.auctionService.getOne(this.auctionId).subscribe((res) => {
        const { auction, offer } = res;
        this.bids = auction.bids.sort((a, b) => (a.bidAmount < b.bidAmount ? 1 : -1));
        const max = Math.max.apply(
          Math,
          auction.bids.map((bid) => bid.bidAmount)
        );
        this.maxBid = auction.bids.filter((bid) => bid.bidAmount === max)[0];

        const leftTimeOnAuction = Math.round((new Date(auction.expirationTime).getTime() - new Date().getTime()) / 1000);
        this.countDownConfig = {
          leftTime: leftTimeOnAuction,
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

        this.auction = auction;
        this.offer = offer;
      });

      const { observableNewBid, observableExpireAuction } = this.auctionService.setupSocketConnection(this.auctionId);

      observableNewBid.subscribe((res) => {
        const bid = { bidAmount: res.bidAmount, createdAt: new Date(), userId: res.userId };
        this.bids.unshift(bid);
        this.maxBid = bid;
      });
      observableExpireAuction.subscribe((res) => {
        this.auction.status = res.status;
        this.auction.winnerId.username = res.winnerId?.username;
      });
    }
  }

  isPolygonChain(chain: string): boolean {
    return chain && (chain.toUpperCase() === 'MUMBAI' || chain.toUpperCase() === 'POLYGON');
  }

  OnDestroy(): void {
    this.auctionService.disconnectSocket();
  }

  async placeBid() {
    this.connectWalletValidation = !this.walletService.isWalletActive();
    if (this.connectWalletValidation) {
      return;
    }

    this.bidValidation = this.maxBid ? this.userBid <= this.maxBid.bidAmount : this.userBid <= this.auction.startingBid;
    if (this.bidValidation) {
      return;
    }

    this.showWizardDialog();

    try {
      this.balance = await this.walletService.getBalance();
    } catch (err) {
      Swal.fire({
        icon: 'info',
        title: "<p class='text-white'>Please switch Test Net to GOERLI to proceed!</p>",
        background: '#5b5353',
        iconColor: 'white'
      });
      this.wizardService.close();
      return;
    }

    this.balanceValidation = this.balance < this.userBid;
    if (this.balanceValidation) {
      this.wizardService.close();
      return;
    }

    this.wizardService.advanceStages();
    if (this.maxBid && this.maxBid.userId.username === this.user.email) {
      const { isDenied, isDismissed } = await Swal.fire({
        icon: 'info',
        title: "<p class='text-white'>Maximum bid on this auction is already yours <br /> Do you still want to place bid?</p>",
        position: 'top-right',
        showDenyButton: true,
        confirmButtonText: 'yes',
        denyButtonText: 'No',
        background: '#5b5353',
        iconColor: 'white'
      });

      if (isDenied || isDismissed) {
        this.wizardService.close();
        return;
      }
    }

    this.maxBid = this.userBid;
    this.wizardService.advanceStages();
    this.auctionService.addBid(this.userBid, this.auctionId, false).subscribe((bidResponse) => {
      this.wizardService.close();
      Swal.fire({
        icon: 'success',
        title: "<p class='text-white'>New bid has been placed!</p>",
        showConfirmButton: false,
        timer: 2000,
        background: '#5b5353',
        iconColor: 'white'
      });
    });
  }
  openPanel(name: string, panel: string) {
    if (panel === 'activePanel') {
      if (this.activePanel === '' || this.activePanel !== name) {
        this.activePanel = name;
      } else {
        this.activePanel = '';
      }
    }
    if (panel === 'activePanel2') {
      if (this.activePanel2 === '' || this.activePanel2 !== name) {
        this.activePanel2 = name;
      } else {
        this.activePanel2 = '';
      }
    }
    if (panel === 'activePanel3') {
      if (this.activePanel3 === '' || this.activePanel3 !== name) {
        this.activePanel3 = name;
      } else {
        this.activePanel3 = '';
      }
    }
  }

  // copied from src/app/modules/bookcoin/collection-detail/collection-detail.component.ts
  addToCart() {
    const saleNFT = this.specificOffer;
    const item = {
      _id: saleNFT.id,
      count: 1,
      image: saleNFT.nft.imageUrl,
      name: saleNFT.nft.name,
      price: saleNFT.price,
      sellerAddress: saleNFT.sellerAddress,
      smartContractAddress: saleNFT.nft.contract.address,
      subTotal: saleNFT.price,
      tokenId: saleNFT.nft.id
    };

    this.cartService.addItemToCart(item);
    this.router.navigateByUrl('/cart');
  }
  private showWizardDialog() {
    const stages: WizardStage[] = [
      {
        name: 'Checking Balance',
        status: 'dormant',
        description: 'Checking balance of your Wallet'
      },
      {
        name: 'Submitting Bid',
        status: 'dormant',
        description: 'Placing your bid'
      }
    ];

    this.wizardService.showWizard('Creating your NFT', stages, true);
  }
}
