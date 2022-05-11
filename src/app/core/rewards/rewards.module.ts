import { NgModule } from '@angular/core';
import { HttpClientModule } from '@angular/common/http';
import { RewardsService } from './rewards.service';

@NgModule({
  imports: [HttpClientModule],
  providers: [RewardsService]
})
export class RewardsModule {}
