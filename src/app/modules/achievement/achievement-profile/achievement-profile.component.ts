import { Component, NgZone, OnInit } from '@angular/core';
import { AchievementService } from 'app/core/achievement/achievement.service';
import { AuthService } from 'app/core/auth/auth.service';
import { User } from 'app/core/user/user.types';
import { WalletService } from 'app/core/wallet/wallet.service';

@Component({
  selector: 'app-achievement-profile',
  templateUrl: './achievement-profile.component.html',
  styleUrls: ['./achievement-profile.component.css']
})
export class AchievementProfileComponent implements OnInit {
  user: User;
  walletAddress: string;
  achievementList: any = [];
  constructor(private authService: AuthService, private walletService: WalletService, private ngZone: NgZone, private achievementService: AchievementService) {}

  ngOnInit(): void {
    if (this.authService.user) {
      this.user = this.authService.user;
      this.getAll();
    } else {
      this.authService.signOut();
    }
  }

  getAll() {
    this.achievementService.byUser().subscribe((x) => {
      if (x.data && x.data.length > 0) {
        this.achievementList = x.data;
      }
    });
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
