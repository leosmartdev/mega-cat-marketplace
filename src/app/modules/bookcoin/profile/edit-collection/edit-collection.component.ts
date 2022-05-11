import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { ErrorsService } from 'app/core/errors/errors.service';
import { ProductService } from 'app/core/product/product.service';
import { Reward } from 'app/core/rewards/rewards';
import { RewardsService } from 'app/core/rewards/rewards.service';
import { WizardDialogService } from 'app/shared/wizard-dialog-service/wizard-dialog.service';
import { WizardStage } from 'app/shared/wizard-dialog-service/wizard-stage.model';
import Swal from 'sweetalert2';

const rewardNone = {
  id: '0',
  title: 'Select None',
  markdown: ''
};

@Component({
  selector: 'app-edit-collection',
  templateUrl: './edit-collection.component.html',
  styleUrls: ['./edit-collection.component.scss']
})
export class EditCollectionComponent implements OnInit {
  smartContractAddress: string;
  chain: string;
  rewards: Reward[] = [rewardNone];
  collection;
  editCollectionForm: FormGroup;

  constructor(
    private route: ActivatedRoute,
    private productService: ProductService,
    private rewardService: RewardsService,
    private formBuilder: FormBuilder,
    private errorsService: ErrorsService,
    private router: Router,
    private wizardService: WizardDialogService
  ) {}

  ngOnInit(): void {
    this.smartContractAddress = this.route.snapshot.params['smartContractAddress'];
    this.chain = this.route.snapshot.params['chain'];
    this.editCollectionForm = this.formBuilder.group({
      name: ['', Validators.required],
      subheading: ['', Validators.required],
      description: ['', Validators.required],
      selectedReward: [rewardNone.title]
    });

    this.productService.getCollectionDetail(this.smartContractAddress, this.chain).subscribe((res) => {
      this.collection = res.data;
      this.editCollectionForm.controls['name'].setValue(this.collection.name);
      this.editCollectionForm.controls['subheading'].setValue(this.collection.subheading);
      this.editCollectionForm.controls['description'].setValue(this.collection.description);

      if (this.collection.reward) {
        this.rewards.push({
          id: this.collection.reward.rewardId,
          title: this.collection.reward.title,
          markdown: this.collection.reward.markdown
        });
        this.editCollectionForm.controls['selectedReward'].setValue(this.collection.reward.title);
      }

      this.rewardService.listUnassignedRewards().subscribe((rewards) => {
        this.rewards.push(...rewards);
      });
    });
  }

  editCollection() {
    this.showWizardDialog();
    this.editCollectionForm.disable();
    const formData = new FormData();
    formData.append('name', this.editCollectionForm.value.name);
    formData.append('description', this.editCollectionForm.value.description);
    formData.append('subheading', this.editCollectionForm.value.subheading);
    formData.append('collectionId', this.collection._id);

    if (this.editCollectionForm.value.selectedReward !== rewardNone.title) {
      const selectedRewardIndex = this.rewards.findIndex((reward) => reward.title === this.editCollectionForm.value.selectedReward);

      if (selectedRewardIndex !== -1) {
        formData.append('rewardId', this.rewards[selectedRewardIndex].id);
      }
    }

    this.productService.editCollection(formData).subscribe(
      (res) => {
        this.wizardService.advanceStages();
        Swal.fire({
          icon: 'success',
          title: '<p style="color:white;">Collection Saved Successfully!</p>',
          showConfirmButton: false,
          timer: 2000,
          background: '#5b5353',
          iconColor: 'white'
        });
        this.router.navigate(['/profile/list-collections']);
      },
      (error) => {
        this.wizardService.failStage(error);
        this.errorsService.openSnackBar('Something went wrong!', 'Error');
        this.editCollectionForm.enable();
      }
    );
  }

  private showWizardDialog() {
    const stages: WizardStage[] = [
      {
        name: 'Saving',
        status: 'dormant',
        description: 'Saving your changes to the database'
      }
    ];

    this.wizardService.showWizard('Saving Your Changes', stages, true);
  }
}
