import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClientModule } from '@angular/common/http';
import { AchievementService } from './achievement.service';

@NgModule({
  imports: [CommonModule, HttpClientModule],
  providers: [AchievementService]
})
export class AchievementModule {}
