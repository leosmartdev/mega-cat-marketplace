import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { AchievementRoutingModule } from './achievement-routing.module';
import { AchievementProfileComponent } from './achievement-profile/achievement-profile.component';
import { AchievementLandingComponent } from './achievement-landing/achievement-landing.component';
import { ProfileModule } from '../admin/profile/profile.module';
import { HttpClientModule } from '@angular/common/http';
import { AchievementService } from 'app/core/achievement/achievement.service';

@NgModule({
  declarations: [AchievementProfileComponent, AchievementLandingComponent],
  providers: [AchievementService],
  imports: [HttpClientModule, CommonModule, AchievementRoutingModule, ProfileModule]
})
export class AchievementModule {}
