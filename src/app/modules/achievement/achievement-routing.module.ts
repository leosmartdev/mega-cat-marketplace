import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { AchievementProfileComponent } from './achievement-profile/achievement-profile.component';
import { AchievementLandingComponent } from './achievement-landing/achievement-landing.component';

const routes: Routes = [
  {
    path: '',
    component: AchievementLandingComponent
  },
  {
    path: 'profile',
    component: AchievementProfileComponent
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class AchievementRoutingModule {}
