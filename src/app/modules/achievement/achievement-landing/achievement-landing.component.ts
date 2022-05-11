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
      this.getAchievementList();
    } else {
      this.authService.signOut();
    }
  }

  getAchievementList() {
    this.achievementService.byUser(true).subscribe((x) => {
      if (x.data && x.data.length > 0) {
        this.achievementList = x.data;
        this.inprogressAchievementList = [...x.data].filter((a) => a.state === 'Inprogress');
        this.last7dayCount = x.last7dayCount || 0;
        this.lastMonthCount = x.lastMonthCount || 0;
      }
      this.initDisplayAchievements();
    });
  }

  initDisplayAchievements() {
    this.adjustIndexAndShowMoreFlag();
    this.displayAchievements = this.getFilterAchievements().slice(0, this.currentIndex);
  }

  getFilterAchievements() {
    let filterAchievements = this.achievementList;
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
