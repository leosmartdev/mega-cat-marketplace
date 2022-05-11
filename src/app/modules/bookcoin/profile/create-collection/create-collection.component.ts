import { Component, OnInit } from '@angular/core';

import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { ErrorsService } from 'app/core/errors/errors.service';
import { ProductService } from 'app/core/product/product.service';
import { VenlyCollectionResponseModel } from '../../../../core/models/venly-collection-response.model';
import { BsModalRef, BsModalService, ModalOptions } from 'ngx-bootstrap/modal';
import { CollectionCreatedPopupComponent } from '../../../elements/collection-created-popup/collection-created-popup.component';
import { WalletService } from 'app/core/wallet/wallet.service';
import { SharedService } from 'app/core/shared/shared.service';
import { AuthService } from 'app/core/auth/auth.service';
import { WizardDialogService } from 'app/shared/wizard-dialog-service/wizard-dialog.service';
import { WizardStage } from 'app/shared/wizard-dialog-service/wizard-stage.model';
import { environment } from 'environments/environment';
import Swal from 'sweetalert2';
import { RewardsService } from 'app/core/rewards/rewards.service';
import { Reward } from 'app/core/rewards/rewards';

const rewardNone = {
  id: '0',
  title: 'Select None',
  markdown: ''
};

@Component({
  selector: 'app-create-collection',
  templateUrl: './create-collection.component.html',
  styleUrls: ['./create-collection.component.scss']
})
export class CreateCollectionComponent implements OnInit {
  formFieldHelpers: string[] = [''];
  createCollectionForm: FormGroup;
  importCollectionForm: FormGroup;

  fileError: boolean = false;
  productImages = [];
  rewards: Reward[] = [rewardNone];
  activePanel = 'reward-0';
  fileUrl: any;
  loader: boolean = false;
  public modalRef: BsModalRef;
  public url: string = '';
  isAdmin: boolean = false;
  importChain = 'mumbai';
  importChains = [environment.ethereumChain, environment.polygonChain];
  importedSmartAddress = '';
  isImported: boolean = false;
  showImportSection: boolean = false;
  bgColor: string = '#ddba77';
  accentColor: string = '#e04206';

  constructor(
    private activatedRoute: ActivatedRoute,
    private formBuilder: FormBuilder,
    private router: Router,
    private productService: ProductService,
    private errorsService: ErrorsService,
    private modalService: BsModalService,
    private walletService: WalletService,
    private sharedService: SharedService,
    private authService: AuthService,
    private wizardService: WizardDialogService,
    private rewardsService: RewardsService
  ) {
    this.sharedService.url.subscribe((value) => (this.url = value));
  }

  ngOnInit(): void {
    this.sharedService.url.next(this.router.url);
    this.createCollectionForm = this.formBuilder.group({
      name: ['', Validators.required],
      subheading: ['', Validators.required],
      description: ['', Validators.required],
      symbol: ['', Validators.required],
      royalty: [1, Validators.required],
      story: ['', Validators.required],
      perks: ['', Validators.required],
      about: ['', Validators.required],
      images: ['', Validators.required],
      selectedReward: [rewardNone.title],
      previewButtonText: ['', Validators.required],
      previewButtonUrl: ['', Validators.required]
    });
    this.importCollectionForm = this.formBuilder.group({
      import: ['', Validators.required],
      chain: ['', Validators.required]
    });
    this.isAdmin = this.authService.isAdmin();
    this.rewardsService.listUnassignedRewards().subscribe((rewards) => {
      this.rewards.push(...rewards);
    });
  }

  /**
   * Create Collection
   */
  async createCollection(): Promise<void> {
    if (this.createCollectionForm.invalid) {
      return;
    }

    const chain = this.importChain;
    const { status: isSwitched } = await this.walletService.requireChain(chain);
    if (!isSwitched) {
      Swal.fire({
        icon: 'info',
        title: `<p class='text-white'>Please switch MetaMask to ${chain} network to proceed!</p>`,
        background: '#5b5353',
        iconColor: 'white'
      });
      return;
    }

    this.createCollectionForm.disable();
    //this.loader = true;
    this.showWizardDialog();

    const walletAddress = this.walletService.currentAccount;

    const formData = new FormData();
    formData.append('name', this.createCollectionForm.value.name);
    formData.append('description', this.createCollectionForm.value.description);
    formData.append('symbol', this.createCollectionForm.value.symbol);
    formData.append('royalty', this.createCollectionForm.value.royalty);

    if (this.isImported) {
      formData.append('isImported', this.isImported.toString());
      formData.append('smartContractAddress', this.importedSmartAddress);
    }

    formData.append('chain', chain);

    const length = this.createCollectionForm.value.images.length;
    for (let i = 0; i < length; i++) {
      formData.append('images', this.createCollectionForm.value.images[i]);
    }

    formData.append('ownerAddress', walletAddress);

    if (this.createCollectionForm.value.selectedReward !== rewardNone.title) {
      const selectedRewardIndex = this.rewards.findIndex((reward) => reward.title === this.createCollectionForm.value.selectedReward);

      if (selectedRewardIndex !== -1) {
        formData.append('rewardId', this.rewards[selectedRewardIndex].id);
      }
    }

    // Collection BookCoin metadata & Collection Preview
    formData.append('subheading', this.createCollectionForm.value.subheading);
    formData.append('about', this.createCollectionForm.value.about);
    formData.append('story', this.createCollectionForm.value.story);
    formData.append('perks', this.createCollectionForm.value.perks);
    formData.append('previewButtonText', this.createCollectionForm.value.previewButtonText);
    formData.append('previewButtonUrl', this.createCollectionForm.value.previewButtonUrl);
    formData.append('bgColor', this.bgColor);
    formData.append('accentColor', this.accentColor);

    // Create Product
    this.productService.createCollection(formData).subscribe(
      (response) => {
        this.wizardService.advanceStages();
        if (!this.isImported) {
          this.showCollectionModal(response.collection);
        }
        this.errorsService.openSnackBar('Collection created successfully!', 'Success');
        // Navigate to the redirect url
        // this.router.navigateByUrl('/bookcoin/profile');
      },
      () => {
        this.errorsService.openSnackBar('Something went wrong!', 'Error');
        this.createCollectionForm.enable();
        this.wizardService.failStage('Failed to create Collection');
      },
      () => {
        this.createCollectionForm.enable();
        //this.loader = false;
      }
    );
  }

  /**
   * Import Collection
   */
  async importCollection(): Promise<void> {
    this.importCollectionForm.disable();
    this.showImportWizardDialog();

    const formData = new FormData();
    const chain = this.importCollectionForm.value.chain;
    const address = this.importCollectionForm.value.import;
    formData.append('chain', chain);
    formData.append('address', address);

    this.productService.fetchCollectionMetadata(formData).subscribe(
      (response) => {
        this.wizardService.advanceStages();

        if (Object.getOwnPropertyNames(response).length <= 1) {
          // false positive from backend.
          this.errorsService.openSnackBar('No collection information was found. Metadata could not be retrieved.', 'Error');
          this.importCollectionForm.enable();
        }

        // TODO: Determine how to import royalty (do either APIs return it? It is necessary to have this field for imports? I don't think so)
        if (chain === environment.ethereumChain) {
          const openSeaCollection = response.collection;
          const symbol = response.symbol;
          const royalty = response.dev_seller_fee_basis_points;
          this.processOpenSeaCollectionImport(openSeaCollection, symbol, royalty);
        } else if (chain === environment.polygonChain) {
          if (!Boolean(response.result)) {
            this.errorsService.openSnackBar('No collection information was found. Metadata could not be retrieved.', 'Error');
            this.importCollectionForm.enable();
          }
          const royalty = 1.0;
          const venlyCollection = response.result;
          this.processVenlyCollectionImport(venlyCollection, royalty);
        }
        this.isImported = true;
        this.importChain = chain;
        this.importedSmartAddress = address;
        this.errorsService.openSnackBar('Collection imported successfully!', 'Success');
      },
      () => {
        this.errorsService.openSnackBar('Something went wrong!', 'Error');
        this.importCollectionForm.enable();
        this.wizardService.failStage('Failed to import Collection');
      },
      () => {
        this.importCollectionForm.enable();
      }
    );
  }

  processVenlyCollectionImport(venlyCollection: any, royalty: number) {
    const imageUrl = venlyCollection.imageUrl;
    this.createCollectionForm.setValue({
      name: venlyCollection.name,
      subheading: '',
      description: venlyCollection.description,
      symbol: venlyCollection.symbol,
      royalty,
      story: '',
      perks: '',
      about: '',
      images: [imageUrl],
      selectedReward: '',
      previewButtonText: '',
      previewButtonUrl: ''
    });

    if (!Boolean(imageUrl)) {
      return;
    }

    fetch(venlyCollection.imageUrl).then(async (res) => {
      const blob = await res.blob();
      const file = new File([blob], `${venlyCollection.name}_image.jpg`);
      this.createCollectionForm.patchValue({
        images: [file]
      });
    });
    this.fileUrl = imageUrl;
  }

  processOpenSeaCollectionImport(openSeaCollection: any, symbol: any, royalty: number) {
    this.createCollectionForm.setValue({
      name: openSeaCollection.name,
      subheading: openSeaCollection.short_description,
      description: openSeaCollection.description,
      symbol,
      royalty,
      story: '',
      perks: '',
      about: '',
      images: [openSeaCollection.image_url],
      selectedReward: '',
      previewButtonText: '',
      previewButtonUrl: ''
    });
    fetch(openSeaCollection.image_url).then(async (res) => {
      const blob = await res.blob();
      const file = new File([blob], `${openSeaCollection.name}_image.jpg`);
      this.createCollectionForm.patchValue({
        images: [file]
      });
    });
    this.fileUrl = openSeaCollection.image_url;
  }

  /**
   * File on change handler
   */

  onChange(event) {
    const reader = new FileReader();
    const file = event.target.files[0];

    const img = new Image();

    img.src = window.URL.createObjectURL(file);
    reader.readAsDataURL(file);
    reader.onload = () => {
      setTimeout(() => {
        const width = img.naturalWidth;
        const height = img.naturalHeight;

        window.URL.revokeObjectURL(img.src);

        this.fileError = false;
        const images = [];
        if (event.target.files && event.target.files[0]) {
          const filesAmount = event.target.files.length;
          for (let i = 0; i < filesAmount; i++) {
            images.push(event.target.files[i]);
            const newReader = new FileReader();

            newReader.onload = (ev: any) => {
              this.productImages.push(ev.target.result);

              this.createCollectionForm.patchValue({
                images: images
              });
            };

            newReader.readAsBinaryString(event.target.files[i]);
          }
        }

        this.setImageSource(event);
      }, 2000);
    };
  }

  private setImageSource(changeEvent) {
    const reader = new FileReader();

    reader.onload = (event: any) => {
      this.fileUrl = event.target.result;
    };

    reader.onerror = (event: any) => {};

    reader.readAsDataURL(changeEvent.target.files[0]);
  }

  private showCollectionModal(collection: VenlyCollectionResponseModel) {
    const config: ModalOptions = {
      class: 'collection-created-container',
      initialState: {
        collection
      }
    };
    this.modalRef = this.modalService.show(CollectionCreatedPopupComponent, config);
  }
  private showWizardDialog() {
    const stages: WizardStage[] = [
      {
        name: 'Create',
        status: 'dormant',
        description: 'Creating Your Collection.'
      }
    ];

    this.wizardService.showWizard('Creating your Collection', stages, true);
  }

  private showImportWizardDialog() {
    const stages: WizardStage[] = [
      {
        name: 'Import',
        status: 'dormant',
        description: 'Importing Your Collection.'
      }
    ];

    this.wizardService.showWizard('Importing your Collection', stages, true);
  }
}
