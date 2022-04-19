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
import Swal from 'sweetalert2';

@Component({
  selector: 'app-create-collection',
  templateUrl: './create-collection.component.html',
  styleUrls: ['./create-collection.component.scss']
})
export class CreateCollectionComponent implements OnInit {
  formFieldHelpers: string[] = [''];
  createCollectionForm: FormGroup;

  fileError: boolean = false;
  productImages = [];
  fileUrl: any;
  loader: boolean = false;
  public modalRef: BsModalRef;
  public url: string = '';
  isAdmin: boolean = false;

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
    private wizardService: WizardDialogService
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
      royality: [1, Validators.required],
      story: ['', Validators.required],
      perks: ['', Validators.required],
      about: ['', Validators.required],
      images: ['', Validators.required]
    });
    this.isAdmin = this.authService.isAdmin();
  }
  /**
   * Create Collection
   */
  async createCollection(): Promise<void> {
    if (this.createCollectionForm.invalid) {
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

    this.createCollectionForm.disable();
    //this.loader = true;
    this.showWizardDialog();

    const walletAddress = this.walletService.currentAccount;

    const formData = new FormData();
    formData.append('name', this.createCollectionForm.value.name);
    formData.append('subheading', this.createCollectionForm.value.subheading);
    formData.append('about', this.createCollectionForm.value.about);
    formData.append('description', this.createCollectionForm.value.description);
    formData.append('symbol', this.createCollectionForm.value.symbol);
    formData.append('royality', this.createCollectionForm.value.royality);
    formData.append('story', this.createCollectionForm.value.story);
    formData.append('perks', this.createCollectionForm.value.perks);

    const length = this.createCollectionForm.value.images.length;
    for (let i = 0; i < length; i++) {
      formData.append('images', this.createCollectionForm.value.images[i]);
    }

    formData.append('walletAddress', walletAddress);
    console.log(formData.toString());

    // Create Product
    this.productService.createCollection(formData).subscribe(
      (response) => {
        this.wizardService.advanceStages();
        this.showCollectionModal(response.collection);
        console.log('Successfully created a collection', response);
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

        if (width < 1600 || height < 400) {
          this.errorsService.openSnackBar('Banner should be 1600 x 400 size!', 'Error');
        } else {
          this.fileError = false;
          const images = [];
          if (event.target.files && event.target.files[0]) {
            const filesAmount = event.target.files.length;
            for (let i = 0; i < filesAmount; i++) {
              console.log('image', event.target.files[i]);
              images.push(event.target.files[i]);
              const newReader = new FileReader();

              newReader.onload = (ev: any) => {
                console.log(event.target.result);
                this.productImages.push(ev.target.result);

                this.createCollectionForm.patchValue({
                  images: images
                });
              };

              newReader.readAsBinaryString(event.target.files[i]);
            }
          }

          this.setImageSource(event);
        }
      }, 2000);
    };
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
}
