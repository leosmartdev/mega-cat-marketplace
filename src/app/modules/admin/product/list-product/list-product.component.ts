import { Component, OnInit } from '@angular/core';
import { ProductService } from 'app/core/product/product.service';
import { Product } from 'app/core/product/product';
import { FuseConfirmationService } from '@fuse/services/confirmation';
import { FormBuilder, FormGroup } from '@angular/forms';
@Component({
  selector: 'app-list-product',
  templateUrl: './list-product.component.html',
  styleUrls: ['./list-product.component.scss']
})
export class ListProductComponent implements OnInit {
  products: Product[] = [];
  displayedColumns: string[] = ['name', 'description', 'image', 'action'];
  configForm: FormGroup;
  id: number;
  nfts: any[] = [];
  page: number = 1;

  constructor(private _productService: ProductService, private _formBuilder: FormBuilder, private _fuseConfirmationService: FuseConfirmationService) {}

  ngOnInit(): void {
    this.getNFTs();

    // Build the config form
    this.configForm = this._formBuilder.group({
      title: 'Remove product',
      message: 'Are you sure you want to remove this product permanently? <span class="font-medium">This action cannot be undone!</span>',
      icon: this._formBuilder.group({
        show: true,
        name: 'heroicons_outline:exclamation',
        color: 'warn'
      }),
      actions: this._formBuilder.group({
        confirm: this._formBuilder.group({
          show: true,
          label: 'Remove',
          color: 'warn'
        }),
        cancel: this._formBuilder.group({
          show: true,
          label: 'Cancel'
        })
      }),
      dismissible: true
    });
  }

  getNFTs(): void {
    this._productService.listingNFT().subscribe((data: any) => {
      this.nfts = data.data;
    });
  }

  extractFromJson(obj, key) {
    if (obj !== null) {
      const ob = JSON.parse(obj);
      return ob[key];
    }
  }

  extractTokenTypeIdFromJson(obj) {
    if (obj !== null) {
      const ob = JSON.parse(obj);
      const found = ob.attributes.find((x) => x.type === 'system');
      return found.value;
    }
  }

  /**
   * Open confirmation dialog
   */
  // openConfirmationDialog(id: number): void {
  //     // Open the dialog and save the reference of it
  //     const dialogRef = this._fuseConfirmationService.open(
  //         this.configForm.value
  //     );
  //     this.id = id;

  //     // Subscribe to afterClosed from the dialog reference
  //     dialogRef.afterClosed().subscribe((result) => {
  //         if (result === 'confirmed') {
  //             this.deleteProduct(this.id);
  //         } else {
  //             return;
  //         }
  //     });
  // }

  // /**
  //  * Delete Product
  //  */
  // deleteProduct(id: number): void {
  //     this._productService.deleteProduct(id).subscribe((data: Product[]) => {
  //         this.getProducts();
  //     });
  // }
}
