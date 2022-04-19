import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { AuctionBid, AuctionOfferResponse, AuctionResponse, AuctionStates } from 'app/core/auction/auction';
import { AuctionService } from 'app/core/auction/auction.service';
import { AuthService } from 'app/core/auth/auth.service';
import { CartService } from 'app/core/cart/cart.service';
import { User } from 'app/core/user/user.types';
import { WalletService } from 'app/core/wallet/wallet.service';
import { WizardDialogService } from 'app/shared/wizard-dialog-service/wizard-dialog.service';
import { WizardStage } from 'app/shared/wizard-dialog-service/wizard-stage.model';
import { CountdownConfig } from 'ngx-countdown';
import Swal from 'sweetalert2';

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
  selector: 'app-bidding-details',
  templateUrl: './bidding-details.component.html',
  styleUrls: ['./bidding-details.component.scss']
})
export class BiddingDetailsComponent implements OnInit {
  @Input() auctionId: string;
  @Output() addToCart = new EventEmitter<AuctionOfferResponse>();
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

  constructor(private auctionService: AuctionService, private authService: AuthService, private walletService: WalletService, private wizardService: WizardDialogService) {}

  ngOnInit(): void {
    this.user = this.authService.user;
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
        this.countDownConfig.leftTime = leftTimeOnAuction;

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
      console.log(err);
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

  preProcessAddToCart() {
    this.addToCart.emit(this.offer);
  }

  disClaim() {
    this.auctionService.disclaimTopBid(this.auctionId).subscribe((bidResponse) => {
      Swal.fire({
        icon: 'success',
        title: "<p class='text-white'>You have disclaimed!</p>",
        showConfirmButton: false,
        timer: 2000,
        background: '#5b5353',
        iconColor: 'white'
      });
    });
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
