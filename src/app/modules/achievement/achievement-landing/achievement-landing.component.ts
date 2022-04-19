import { Component, NgZone, EventEmitter, OnInit } from '@angular/core';
import { AchievementService } from 'app/core/achievement/achievement.service';
import { AuthService } from 'app/core/auth/auth.service';
import { User } from 'app/core/user/user.types';
import { WalletService } from 'app/core/wallet/wallet.service';

@Component({
  selector: 'app-achievement-landing',
  templateUrl: './achievement-landing.component.html',
  styleUrls: ['./achievement-landing.component.css']
})
export class AchievementLandingComponent implements OnInit {
  user: User;
  displayAchievements = [];
  showLoadMore = false;
  currentIndex = 4;
  allAchievements = [];
  achievementList = [];
  inprogressAchievementList = [];
  stateFilter = '';
  walletAddress: string;
  last7dayCount: number = 0;
  lastMonthCount: number = 0;
  constructor(private authService: AuthService, private achievementService: AchievementService, private walletService: WalletService, private ngZone: NgZone) {}

  ngOnInit(): void {
    if (this.authService.user) {
      this.user = this.authService.user;
      this.getAllAchievements();
      this.getMyAchievementList();
    } else {
      this.authService.signOut();
    }
  }

  getAllAchievements() {
    const allAchievements = [
      {
        id: 'first_time_avatar',
        title: 'First Time Avatar',
        actionTaken: 'Set profile picture for the first time'
      },
      {
        id: 'first_time_buyer',
        title: 'First Time Buyer',
        actionTaken: 'Purchase your first NFT on MCL'
      },
      {
        id: 'big_bidder',
        title: 'Big Bidder',
        actionTaken: 'Win your first auction'
      },
      {
        id: 'barterdom',
        title: 'Barterdom',
        actionTaken: 'Trade NFTs for the first time on MCL'
      },
      {
        id: 'on_the_list',
        title: 'On the List!',
        actionTaken: 'Become an approved seller on MCL'
      },
      {
        id: 'moving_assets',
        title: 'Moving Assets',
        actionTaken: 'List your first NFT for sale on MCL'
      },
      {
        id: 'collector',
        title: 'Collector',
        actionTaken: 'Have at least five purchased NFTs in your collection'
      },
      {
        id: 'merchant',
        title: 'Merchant',
        actionTaken: 'Have at least five NFTs listed for sale at once'
      },
      {
        id: 'trading_post',
        title: 'Trading Post',
        actionTaken: 'Trade at least five NFTs on the MCL marketplace'
      },
      {
        id: 'digital Roadshow',
        title: 'Digital Roadshow',
        actionTaken: 'List your first NFT for auction'
      },
      {
        id: 'bidding_enjoyer',
        title: 'Bidding Enjoyer',
        actionTaken: 'Win five auctions'
      },
      {
        id: 'top_of_the_class',
        title: 'Top of the Class',
        actionTaken: 'Win an auction with at least 10 bids'
      },
      {
        id: 'long_term_commitment',
        title: 'Long Term Commitment',
        actionTaken: 'Have an active MCL account for 1 year'
      },
      {
        id: 'avid_collector',
        title: 'Avid Collector',
        actionTaken: 'Purchase at least 25 NFTs'
      },
      {
        id: 'art_broker',
        title: 'Art Broker',
        actionTaken: 'Sell at least 25 NFTs'
      },
      {
        id: 'put_yourself_out_there',
        title: 'Put Yourself Out There',
        actionTaken: 'Fully complete your user profile'
      },
      {
        id: 'well_rounded',
        title: 'Well Rounded',
        actionTaken: 'Purchase, List, Trade, and win an auction at least one time each'
      },
      {
        id: 'creative_first',
        title: 'Creative First',
        actionTaken: 'Mint your first NFT for sale on MCL'
      },
      {
        id: 'dedication',
        title: 'Dedication',
        actionTaken: 'Log in for five days consecutively'
      },
      {
        id: 'super_fan',
        title: 'Super Fan',
        actionTaken: 'Log in once a week for a year'
      },
      {
        id: 'big_money_moves',
        title: 'Big Money Moves',
        actionTaken: 'Relist and sell a NFT for at least twice its original purchase value'
      },
      {
        id: 'lucky',
        title: 'Lucky',
        actionTaken: "Win an auction where the original highest bidder didn't claim the item"
      }
    ];
    this.allAchievements = allAchievements.map((a) => {
      const mergeResult = {
        ...a,
        ...{
          state: 'Locked',
          nftname: null,
          point: 0
        }
      };
      return mergeResult;
    });
  }

  getMyAchievementList() {
    this.achievementService.byUser().subscribe((x) => {
      if (x.data && x.data.length > 0) {
        this.achievementList = x.data;
        this.inprogressAchievementList = [...x.data].filter((a) => a.state === 'Inprogress');
        this.last7dayCount = x.last7dayCount || 0;
        this.lastMonthCount = x.lastMonthCount || 0;

        this.allAchievements.forEach((achievement, index) => {
          const searchIndex = this.achievementList.findIndex((value) => value.achievementId === achievement.id);
          if (searchIndex > -1) {
            const data = this.achievementList[searchIndex];
            const originData = this.allAchievements[index];
            this.allAchievements[index] = {
              ...originData,
              ...{
                state: data.state,
                nftid: data.nftid,
                nftname: data.nftname,
                point: data.point,
                image: data.image,
                type: data.type
              }
            };
          }
        });
      }
      this.initDisplayAchievements();
    });
  }

  initDisplayAchievements() {
    this.adjustIndexAndShowMoreFlag();
    this.displayAchievements = this.getFilterAchievements().slice(0, this.currentIndex);
  }

  getFilterAchievements() {
    let filterAchievements = this.allAchievements;
    console.log(this.stateFilter);
    if (this.stateFilter !== '') {
      filterAchievements = filterAchievements.filter((value) => value.state === this.stateFilter);
    }
    return filterAchievements;
  }

  public onLoadMore(event) {
    this.currentIndex += 4;
    this.initDisplayAchievements();
  }

  public changeStateFilter(event) {
    this.stateFilter = event.target.value;
    if (this.currentIndex < 4) {
      this.currentIndex = 4;
    }
    this.initDisplayAchievements();
  }

  adjustIndexAndShowMoreFlag() {
    const filterAchievements = this.getFilterAchievements();
    if (this.currentIndex >= filterAchievements.length) {
      this.currentIndex = filterAchievements.length;
      this.showLoadMore = false;
    } else {
      this.showLoadMore = true;
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
      });
    });
  }
}
