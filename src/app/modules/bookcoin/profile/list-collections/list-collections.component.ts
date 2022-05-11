import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { ErrorsService } from 'app/core/errors/errors.service';
import { ProductService } from 'app/core/product/product.service';

@Component({
  selector: 'app-list-collections',
  templateUrl: './list-collections.component.html',
  styleUrls: ['./list-collections.component.scss']
})
export class ListCollectionsComponent implements OnInit {
  collections = [];
  page: number = 1;
  displayedColumns: string[] = ['name', 'action'];
  searchCollectionForm: FormGroup;
  filteredCollections = [];

  constructor(private productService: ProductService, private errorsService: ErrorsService, private router: Router, private formBuilder: FormBuilder) {}

  ngOnInit(): void {
    this.searchCollectionForm = this.formBuilder.group({
      collectionName: ['', Validators.required]
    });

    this.productService.getAllCollections().subscribe(
      (res) => {
        this.collections = res.collections;
        this.filteredCollections = this.collections;
      },
      (error) => {
        this.errorsService.openSnackBar('Error', 'Something went wrong');
      }
    );
  }

  editCollection(smartContractAddress: string, chain: string) {
    if (smartContractAddress) {
      this.router.navigate([`/profile/edit-collection/${smartContractAddress}/${chain}`]);
    }
  }

  searchCollection() {
    if (this.searchCollectionForm.value.collectionName) {
      this.filteredCollections = this.collections.filter((collection) => collection.name.toLowerCase().includes(this.searchCollectionForm.value.collectionName.toLowerCase()));
    } else {
      this.filteredCollections = this.collections;
    }
  }
}
