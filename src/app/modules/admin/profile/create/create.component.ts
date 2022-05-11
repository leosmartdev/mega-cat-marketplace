import { BsModalRef, BsModalService, ModalOptions } from 'ngx-bootstrap/modal';
import { VenlyNftCreatedResponse } from './../../../../core/models/venly/venly-nft-created-response.model';
import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { ErrorsService } from 'app/core/errors/errors.service';
import { ProductService } from 'app/core/product/product.service';
import { ProgressSpinnerMode } from '@angular/material/progress-spinner';
import { WalletService } from 'app/core/wallet/wallet.service';
import { NftCreatedPopupComponent } from 'app/modules/elements/nft-created-popup/nft-created-popup.component';
import { WizardStage } from 'app/shared/wizard-dialog-service/wizard-stage.model';
import { WizardDialogService } from 'app/shared/wizard-dialog-service/wizard-dialog.service';
import { NftUtilsService } from 'app/shared/nft-utils.service';

@Component({
  selector: 'app-create',
  templateUrl: './create.component.html',
  styleUrls: ['./create.component.scss']
})
export class CreateComponent implements OnInit {
  formFieldHelpers: string[] = [''];
  createProductForm: FormGroup;
  properties: any[] = [];
  propertiesForm: FormGroup;
  fileError: boolean = false;
  productImages = [];
  fileUrl: any;
  collections: any[] = [];
  modalRef: BsModalRef;

  constructor(
    private activatedRoute: ActivatedRoute,
    private formBuilder: FormBuilder,
    private router: Router,
    private productService: ProductService,
    private errorsService: ErrorsService,
    private walletService: WalletService,
    private modalService: BsModalService,
    private wizardService: WizardDialogService,
    private nftUtilsService: NftUtilsService
  ) {}

  ngOnInit(): void {
    this.createProductForm = this.formBuilder.group({
      name: ['', Validators.required],
      description: ['', Validators.required],
      properties: this.properties,
      images: ['', Validators.required],
      selectedCollection: ['', Validators.required],
      supply: [1, Validators.required]
    });

    this.propertiesForm = this.formBuilder.group({
      type: ['property'],
      name: ['', Validators.required],
      value: ['', Validators.required]
    });

    this.productService
      .getCollections({
        walletAddress: this.walletService.currentAccount
      })
      .subscribe(
        (res) => {
          this.collections = res.collections;
        },
        () => {}
      );
  }

  // -----------------------------------------------------------------------------------------------------
  // @ Public methods
  // -----------------------------------------------------------------------------------------------------

  /**
   * Create product
   */
  async createProduct(): Promise<void> {
    if (this.createProductForm.invalid) {
      this.fileError = true;
      return;
    }

    // Disable the form
    this.createProductForm.disable();
    this.showWizardDialog();

    const walletAddress = this.walletService.currentAccount;

    const formData = new FormData();
    formData.append('name', this.createProductForm.value.name);
    formData.append('supply', this.createProductForm.value.supply);
    formData.append('description', this.createProductForm.value.description);
    formData.append('properties', JSON.stringify(this.properties));
    const length = this.createProductForm.value.images.length;
    for (let i = 0; i < length; i++) {
      formData.append('images', this.createProductForm.value.images[i]);
    }

    const selectedOptionIndex = this.collections.findIndex((coll) => coll.name === this.createProductForm.value.selectedCollection);
    if (selectedOptionIndex !== -1) {
      formData.append('mongoCollectionId', this.collections[selectedOptionIndex]._id);
    }

    formData.append('walletAddress', walletAddress);

    await this.nftUtilsService.delay(500);
    this.wizardService.advanceStages();

    // Create Product
    this.productService.createProduct(formData).subscribe(
      (response: { message: string; data: VenlyNftCreatedResponse[] }) => {
        const nftCreatedResponse = response.data[0];
        this.showNftCreatedModal(nftCreatedResponse);
        this.errorsService.openSnackBar('Product created successfully!', 'Success');
        this.router.navigateByUrl('/profile');
      },
      (error) => {
        this.wizardService.failStage(error);
        this.errorsService.openSnackBar('Something went wrong!', 'Error');
        this.createProductForm.enable();
      },
      () => {
        this.wizardService.advanceStages();
        this.createProductForm.enable();
      }
    );
  }

  deleteProperty(index) {
    this.properties = this.properties.filter((obj) => this.properties.indexOf(obj) !== index);
  }

  addToProperties(): void {
    if (this.propertiesForm.invalid) {
      return;
    } else {
      this.properties.push(this.propertiesForm.value);
      this.propertiesForm.reset();
      this.propertiesForm.controls['name'].setErrors(null);
      this.propertiesForm.controls['value'].setErrors(null);
      this.propertiesForm.controls['type'].setValue('property');
    }
  }

  onChange(event) {
    this.fileError = false;
    const images = [];
    if (event.target.files && event.target.files[0]) {
      const filesAmount = event.target.files.length;
      for (let i = 0; i < filesAmount; i++) {
        images.push(event.target.files[i]);
        const reader = new FileReader();

        reader.onload = (ev: any) => {
          this.productImages.push(ev.target.result);

          this.createProductForm.patchValue({
            images: images
          });
        };

        reader.readAsBinaryString(event.target.files[i]);
      }
    }

    this.setImageSource(event);
  }

  private showWizardDialog() {
    const stages: WizardStage[] = [
      {
        name: 'Preparing',
        status: 'dormant',
        description: 'Preparing data to create'
      },
      {
        name: 'Creating',
        status: 'dormant',
        description: 'Adding to the database'
      }
    ];

    this.wizardService.showWizard('Creating Your NFT', stages, true);
  }

  private setImageSource(changeEvent) {
    const reader = new FileReader();

    reader.onload = (event: any) => {
      this.fileUrl = event.target.result;
    };

    reader.onerror = (event: any) => {};

    reader.readAsDataURL(changeEvent.target.files[0]);
  }

  private showNftCreatedModal(nftCreatedResponse: VenlyNftCreatedResponse) {
    const config: ModalOptions = {
      class: 'nft-created-container',
      initialState: {
        nft: nftCreatedResponse
      }
    };

    this.modalRef = this.modalService.show(NftCreatedPopupComponent, config);
  }
}
