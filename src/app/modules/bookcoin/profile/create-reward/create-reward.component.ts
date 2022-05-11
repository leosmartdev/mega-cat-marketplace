import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ProductService } from 'app/core/product/product.service';
import { RewardsService } from 'app/core/rewards/rewards.service';
import { WizardDialogService } from 'app/shared/wizard-dialog-service/wizard-dialog.service';
import { ErrorsService } from 'app/core/errors/errors.service';
import { WizardStage } from 'app/shared/wizard-dialog-service/wizard-stage.model';
import { NftUtilsService } from 'app/shared/nft-utils.service';
import { BsModalRef, BsModalService, ModalOptions } from 'ngx-bootstrap/modal';
import { Reward } from 'app/core/rewards/rewards';
import { RewardCreatedPopupComponent } from 'app/modules/elements/reward-created-popup/reward-created-popup.component';
import { Router } from '@angular/router';

@Component({
  selector: 'app-create-reward',
  templateUrl: './create-reward.component.html',
  styleUrls: ['./create-reward.component.scss']
})
export class CreateRewardComponent implements OnInit {
  createRewardForm: FormGroup;
  file = null;
  isFileUploaded: boolean = true;
  modalRef: BsModalRef;
  editor: any = {
    title: 'Make Up a Title',
    // eslint-disable-next-line max-len
    markdown:
      '## A Heading (h2) \n Here is an example of some body. \n 1. I have some points to make \n 2. You should fill this out. \n * Just an unordered list. \n * of some items'
  };

  constructor(
    private formBuilder: FormBuilder,
    private productService: ProductService,
    private rewardsService: RewardsService,
    private wizardService: WizardDialogService,
    private errorsService: ErrorsService,
    private modalService: BsModalService
  ) {}

  ngOnInit(): void {
    this.createRewardForm = this.formBuilder.group({
      markdown: ['', Validators.required],
      title: ['', Validators.required],
      upload: ['', Validators.required]
    });
  }

  onChange(event) {
    this.file = event.target.files?.[0];
    this.createRewardForm.controls['upload'].setValue(this.file);
    this.isFileUploaded = true;
  }

  createReward() {
    if (this.createRewardForm.invalid) {
      if (!this.file) {
        this.isFileUploaded = false;
      }
      return;
    }

    this.createRewardForm.disable();

    this.showWizardDialog();

    const formData = new FormData();
    formData.append('title', this.createRewardForm.value.title);
    formData.append('file', this.createRewardForm.value.upload);
    formData.append('markdown', this.createRewardForm.value.markdown);

    this.rewardsService.createReward(formData).subscribe(
      (reward: Reward) => {
        this.wizardService.advanceStages();
        this.showRewardCreatedModal(reward);
        this.errorsService.openSnackBar('Reward created successfully!', 'Success');
      },
      (err) => {
        this.wizardService.failStage(err);
        this.errorsService.openSnackBar('Something went wrong!', 'Error');
        this.createRewardForm.enable();
      },
      () => {
        this.createRewardForm.enable();
      }
    );
  }

  private showWizardDialog() {
    const stages: WizardStage[] = [
      {
        name: 'Creating',
        status: 'dormant',
        description: 'Adding to the database'
      }
    ];

    this.wizardService.showWizard('Creating Your Reward', stages, true);
  }

  private showRewardCreatedModal(rewardCreatedResponse: Reward) {
    const config: ModalOptions = {
      class: 'reward-created-container',
      initialState: {
        reward: rewardCreatedResponse
      }
    };

    this.modalRef = this.modalService.show(RewardCreatedPopupComponent, config);
  }
}
