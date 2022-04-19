import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { VenlyNftCreatedResponse } from 'app/core/models/venly/venly-nft-created-response.model';
import { BsModalRef, ModalOptions } from 'ngx-bootstrap/modal';

@Component({
  selector: 'app-nft-created-popup',
  templateUrl: './nft-created-popup.component.html',
  styleUrls: ['./nft-created-popup.component.scss']
})
export class NftCreatedPopupComponent implements OnInit {
  nft: VenlyNftCreatedResponse;

  constructor(public bsModalRef: BsModalRef, public options: ModalOptions, public router: Router) {
    // @ts-ignore
    this.nft = options.initialState.nft;
  }

  ngOnInit(): void {}

  goBackToProfile() {
    this.bsModalRef.hide();
    this.router.navigateByUrl('/profile');
  }
}
