import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { Reward } from 'app/core/rewards/rewards';
import { BsModalRef, ModalOptions } from 'ngx-bootstrap/modal';

@Component({
  selector: 'app-reward-created-popup',
  templateUrl: './reward-created-popup.component.html',
  styleUrls: ['./reward-created-popup.component.scss']
})
export class RewardCreatedPopupComponent implements OnInit {
  reward;

  constructor(public bsModalRef: BsModalRef, public options: ModalOptions, public router: Router) {
    this.reward = options.initialState.reward;
  }

  ngOnInit(): void {}

  goBackToProfile() {
    this.bsModalRef.hide();
    this.router.navigateByUrl('/profile');
  }
}
