import { BsModalRef, BsModalService, ModalOptions } from 'ngx-bootstrap/modal';
import { VenlyNftCreatedResponse } from './../../../../core/models/venly/venly-nft-created-response.model';
import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { ErrorsService } from 'app/core/errors/errors.service';
import { ProductService } from 'app/core/product/product.service';
import { WalletService } from 'app/core/wallet/wallet.service';
import { NftCreatedPopupComponent } from 'app/modules/elements/nft-created-popup/nft-created-popup.component';
import { SharedService } from 'app/core/shared/shared.service';
import { AuthService } from 'app/core/auth/auth.service';
import { WizardDialogService } from 'app/shared/wizard-dialog-service/wizard-dialog.service';
import { WizardStage } from 'app/shared/wizard-dialog-service/wizard-stage.model';
import Swal from 'sweetalert2';
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
  loader: boolean = false;
  collections: any[] = [];
  public url: string = '';
  modalRef: BsModalRef;
  isAdmin: boolean = false;
  thecollection: any;

  constructor(
    private activatedRoute: ActivatedRoute,
    private formBuilder: FormBuilder,
    private router: Router,
    private productService: ProductService,
    private errorsService: ErrorsService,
    private walletService: WalletService,
    private modalService: BsModalService,
    private sharedService: SharedService,
    private authService: AuthService,
    private wizardService: WizardDialogService
  ) {
    this.sharedService.url.subscribe((value) => (this.url = value));
  }

  ngOnInit(): void {
    this.sharedService.url.next(this.router.url);
    this.createProductForm = this.formBuilder.group({
      name: ['', Validators.required],
      description: ['', Validators.required],
      properties: this.properties,
      images: ['', Validators.required],
      selectedCollection: ['', Validators.required],
      supply: [1, Validators.required],
      story: [this.thecollection?.story, Validators.required],
      perks: ['', Validators.required],
      faqs: ['', Validators.required],
      tos: ['', Validators.required]
    });
    this.isAdmin = this.authService.isAdmin();

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
          console.log('collections coming from productService');
          console.log(res);
          this.collections = res.collections;
        },
        () => {
          console.log('something went wrong');
        }
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

    // TODO: Add chain selector!
    const chain = 'mumbai';
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

    // Disable the form
    this.createProductForm.disable();
    //this.loader = true;
    this.showWizardDialog();

    const walletAddress = this.walletService.currentAccount;
    this.properties.push({
      name: 'story',
      value: this.createProductForm.value.story,
      type: 'property'
    });
    this.properties.push({
      name: 'perks',
      value: this.createProductForm.value.perks,
      type: 'property'
    });
    this.properties.push({
      name: 'faqs',
      value: this.createProductForm.value.faqs,
      type: 'property'
    });
    this.properties.push({
      name: 'tos',
      value: this.createProductForm.value.tos,
      type: 'property'
    });

    this.properties.push({
      name: 'story',
      value: this.createProductForm.value.story,
      type: 'property'
    });
    this.properties.push({
      name: 'perks',
      value: this.createProductForm.value.perks,
      type: 'property'
    });
    this.properties.push({
      name: 'faqs',
      value: this.createProductForm.value.faqs,
      type: 'property'
    });
    this.properties.push({
      name: 'tos',
      value: this.createProductForm.value.tos,
      type: 'property'
    });

    const formData = new FormData();
    formData.append('name', this.createProductForm.value.name);
    formData.append('supply', this.createProductForm.value.supply);
    formData.append('description', this.createProductForm.value.description);
    formData.append('properties', JSON.stringify(this.properties));
    formData.append('story', this.createProductForm.value.story);
    formData.append('perks', this.createProductForm.value.perks);
    formData.append('faqs', this.createProductForm.value.faqs);
    formData.append('tos', this.createProductForm.value.tos);
    const length = this.createProductForm.value.images.length;
    for (let i = 0; i < length; i++) {
      formData.append('images', this.createProductForm.value.images[i]);
    }

    const selectedOptionIndex = this.collections.findIndex((coll) => coll.name === this.createProductForm.value.selectedCollection);
    if (selectedOptionIndex !== -1) {
      formData.append('mongoCollectionId', this.collections[selectedOptionIndex]._id);
    }

    formData.append('walletAddress', walletAddress);

    // Create Product
    this.productService.createProduct(formData).subscribe(
      (response: { message: string; data: VenlyNftCreatedResponse[] }) => {
        this.wizardService.advanceStages();
        const nftCreatedResponse = response.data[0];
        this.showNftCreatedModal(nftCreatedResponse);
        this.errorsService.openSnackBar('Product created successfully!', 'Success');
      },
      () => {
        this.errorsService.openSnackBar('Something went wrong!', 'Error');
        this.createProductForm.enable();
        this.wizardService.failStage('Failed to create NFT');
      },
      () => {
        this.createProductForm.enable();
        //this.loader = false;
      }
    );
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
        console.log('image', event.target.files[i]);
        images.push(event.target.files[i]);
        const reader = new FileReader();

        reader.onload = (ev: any) => {
          console.log(event.target.result);
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
  display() {
    this.thecollection = this.collections.find((coll) => coll.name === this.createProductForm.value.selectedCollection);
    this.createProductForm.controls['story'].setValue(this.thecollection.story);
    this.createProductForm.controls['perks'].setValue(this.thecollection.perks);
    console.log('specific collection', this.thecollection.story);
  }

  private setImageSource(changeEvent) {
    const reader = new FileReader();

    reader.onload = (event: any) => {
      this.fileUrl = event.target.result;
    };

    reader.onerror = (event: any) => {
      console.log(`File could not be read: ${event.target.error.code}`);
    };

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
  private showWizardDialog() {
    const stages: WizardStage[] = [
      {
        name: 'Create',
        status: 'dormant',
        description: 'Creating Your NFT.'
      }
    ];

    this.wizardService.showWizard('Creating your NFT', stages, true);
  }
}
