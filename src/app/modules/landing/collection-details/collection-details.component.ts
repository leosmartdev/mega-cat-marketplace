import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { ProductService } from 'app/core/product/product.service';
import { Product } from 'app/core/product/product';
import { BsModalService, BsModalRef } from 'ngx-bootstrap/modal';
import { CartService } from '../../../core/cart/cart.service';

@Component({
  selector: 'app-collection-details',
  templateUrl: './collection-details.component.html',
  styleUrls: ['./collection-details.component.scss']
})
export class CollectionDetailsComponent implements OnInit {
  product: Product;
  offer: any;
  id: string;
  show: boolean = false;
  public modalRef: BsModalRef;

  constructor(private activatedRoute: ActivatedRoute, private productService: ProductService, private modalService: BsModalService, private cartService: CartService) {}

  ngOnInit(): void {
    this.id = this.activatedRoute.snapshot.params['id'];
    this.productService.specificOffer(this.id).subscribe((data) => {
      this.offer = data.data;
    });
  }

  addToCart(saleNFT: any) {
    // TODO: Make this a Product and fix tests and code.
    const item = {
      _id: saleNFT.id,
      name: saleNFT.nft.name,
      tokenId: saleNFT.nft.tokenId,
      image: saleNFT.nft.imageUrl,
      price: saleNFT.price,
      count: 1,
      subTotal: saleNFT.price,
      collection: saleNFT.collection,
      sellerAddress: saleNFT.sellerAddress
    };

    this.cartService.addItemToCart(item);
  }
}
