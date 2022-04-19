import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { ErrorsService } from 'app/core/errors/errors.service';
import { ProductService } from 'app/core/product/product.service';
import { ProgressSpinnerMode } from '@angular/material/progress-spinner';
@Component({
  selector: 'app-edit-product',
  templateUrl: './edit-product.component.html',
  styleUrls: ['./edit-product.component.scss']
})
export class EditProductComponent implements OnInit {
  id: string;
  formFieldHelpers: string[] = [''];
  createProductForm: FormGroup;
  properties: any[] = [];
  propertiesForm: FormGroup;
  fileError: boolean = false;
  productImages = [];
  fileUrl: any;
  loader: boolean = false;

  /**
   * Constructor
   */
  constructor(
    private _activatedRoute: ActivatedRoute,
    private _formBuilder: FormBuilder,
    private _router: Router,
    private _productService: ProductService,
    private _errorsService: ErrorsService
  ) {}

  // -----------------------------------------------------------------------------------------------------
  // @ Lifecycle hooks
  // ---

  ngOnInit(): void {
    this.id = this._activatedRoute.snapshot.params['id'];

    this.createProductForm = this._formBuilder.group({
      name: ['', Validators.required],
      description: ['', Validators.required],
      properties: this.properties,
      images: ['', Validators.required]
    });

    this.propertiesForm = this._formBuilder.group({
      type: ['property'],
      name: ['', Validators.required],
      value: ['', Validators.required]
    });

    this._productService.getNFTMetadata(this.id).subscribe(
      (response) => {
        const data = response;
        this.createProductForm.controls['name'].setValue(data.data.name);
        this.createProductForm.controls['description'].setValue(data.data.description);
        this.properties = data.data.attributes;
      },
      () => {
        this._errorsService.openSnackBar('Something went wrong!', 'Error');
        this.createProductForm.disable();
      }
    );
  }

  // -----------------------------------------------------------------------------------------------------
  // @ Public methods
  // -----------------------------------------------------------------------------------------------------

  /**
   * Create product
   */
  createProduct(): void {
    if (this.createProductForm.invalid) {
      this.fileError = true;
      return;
    }

    // Disable the form
    this.createProductForm.disable();
    this.loader = true;

    const formData = new FormData();
    formData.append('name', this.createProductForm.value.name);
    formData.append('description', this.createProductForm.value.description);
    formData.append('properties', JSON.stringify(this.properties));
    const length = this.createProductForm.value.images.length;
    for (let i = 0; i < length; i++) {
      formData.append('images', this.createProductForm.value.images[i]);
    }

    formData.append('id', this.id.toString());

    // Create Product
    this._productService.updateMetadata(formData).subscribe(
      (res) => {
        const redirectURL = this._activatedRoute.snapshot.queryParamMap.get('redirectURL') || '/list-product';

        this._errorsService.openSnackBar('Template Edited successfully!', 'Success');
        // Navigate to the redirect url
        this._router.navigateByUrl(redirectURL);
      },
      () => {
        this._errorsService.openSnackBar('Something went wrong!', 'Error');
        this.createProductForm.enable();
        this.loader = false;
      },
      () => {
        this.createProductForm.enable();
        this.loader = false;
      }
    );
  }

  cancel() {
    const redirectURL = this._activatedRoute.snapshot.queryParamMap.get('redirectURL') || '/list-product';

    // Navigate to the redirect url
    this._router.navigateByUrl(redirectURL);
  }
  /**
   * Add To Properties
   */
  addToProperties(): void {
    // Return if the form is invalid
    if (this.propertiesForm.invalid) {
      return;
    } else {
      this.properties.push(this.propertiesForm.value);
      // Reset the form
      this.propertiesForm.reset();
      this.propertiesForm.controls['name'].setErrors(null);
      this.propertiesForm.controls['value'].setErrors(null);
      this.propertiesForm.controls['type'].setValue('property');
    }
  }

  /**
   * File on change handler
   */

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

  private setImageSource(changeEvent) {
    const reader = new FileReader();

    reader.onload = (event: any) => {
      this.fileUrl = event.target.result;
    };

    reader.onerror = (event: any) => {};

    reader.readAsDataURL(changeEvent.target.files[0]);
  }
}
