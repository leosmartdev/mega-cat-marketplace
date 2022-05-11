import { Component, OnInit } from '@angular/core';
import { RewardsService } from 'app/core/rewards/rewards.service';
import { Reward } from 'app/core/rewards/rewards';
import { ErrorsService } from 'app/core/errors/errors.service';

@Component({
  selector: 'app-list-rewards',
  templateUrl: './list-rewards.component.html',
  styleUrls: ['./list-rewards.component.scss']
})
export class ListRewardsComponent implements OnInit {
  rewards: Reward[];
  isFetchingRewards: boolean = true;

  constructor(private rewardsService: RewardsService, private errorsService: ErrorsService) {}

  ngOnInit(): void {
    this.rewardsService.listRewards().subscribe(
      (rewards) => {
        this.rewards = rewards;
        this.isFetchingRewards = false;
      },
      (error) => {
        this.errorsService.openSnackBar('Something went wrong!', error);
      }
    );
  }
}
