import { Component, Input, OnInit } from '@angular/core';
import { CartService } from 'app/core/cart/cart.service';
import { CartItem } from 'app/core/cart/cartItem';
import { NftCardModel } from 'app/core/models/nft-card.model';
import { BsModalRef, BsModalService } from 'ngx-bootstrap/modal';
@Component({
  selector: 'app-modal',
  templateUrl: './modal.component.html',
  styleUrls: ['./modal.component.scss']
})
export class ModalComponent implements OnInit {
  public saleNFT: NftCardModel | any;

  constructor(private modalService: BsModalService, private cartService: CartService) {}

  ngOnInit(): void {
    this.saleNFT = this.modalService.config.initialState;
  }

  addToCart(saleNFT: NftCardModel) {
    const item: CartItem = {
      _id: saleNFT.listing.id,
      name: saleNFT.name,
      tokenId: saleNFT.tokenId,
      collection: saleNFT.contract.address,
      image: saleNFT.image,
      price: saleNFT.listing.price,
      count: 1,
      subTotal: saleNFT.listing.price,
      sellerAddress: saleNFT.listing.sellerAddress
    };

    this.cartService.addItemToCart(item);
    this.modalService.hide();
  }
}
