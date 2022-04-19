import { Component, OnInit } from '@angular/core';
import { VenlyCollectionResponseModel } from '../../../core/models/venly-collection-response.model';
import { BsModalRef, ModalOptions } from 'ngx-bootstrap/modal';
import { Router } from '@angular/router';

@Component({
  selector: 'app-collection-created-popup',
  templateUrl: './collection-created-popup.component.html',
  styleUrls: ['./collection-created-popup.component.scss']
})
export class CollectionCreatedPopupComponent implements OnInit {
  collection: VenlyCollectionResponseModel;

  constructor(public bsModalRef: BsModalRef, public options: ModalOptions, public router: Router) {
    // @ts-ignore
    this.collection = options.initialState.collection;
  }

  ngOnInit(): void {}

  goBackToProfile() {
    this.bsModalRef.hide();
    this.router.navigateByUrl('/profile');
  }
}
