import { Component, OnInit, NgZone } from '@angular/core';
import { AchievementSocketService } from 'app/core/achievement/achievementsocket.service';
import { AuthService } from 'app/core/auth/auth.service';

@Component({
  selector: 'app-bookcoin-landing-layout',
  templateUrl: './bookcoin-landing-layout.component.html',
  styleUrls: ['./bookcoin-landing-layout.component.scss']
})
export class BookCoinLandingLayoutComponent implements OnInit {
  constructor(private authService: AuthService, private achievementSocketService: AchievementSocketService) {}

  ngOnInit(): void {
    if (this.authService.user) {
      const { observableNewAchievement } = this.achievementSocketService.setupSocketConnection(this.authService.user._id);
      observableNewAchievement.subscribe((res) => {});
    } else {
      this.authService.signOut();
    }
  }

  OnDestroy(): void {
    if (this.authService.user) {
      this.achievementSocketService.disconnectSocket();
    }
  }
}
