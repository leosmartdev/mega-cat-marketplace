import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { AuthService } from 'app/core/auth/auth.service';
import { CartService } from 'app/core/cart/cart.service';
import { VenlyNftMetadataByContractAndTokenId } from 'app/core/models/venly/venly-nft-by-contract-and-token.model';
import { ProductService } from 'app/core/product/product.service';
import { SharedService } from 'app/core/shared/shared.service';
import { User } from 'app/core/user/user.types';
import { VenlyService } from 'app/core/venly/venly.service';
import { NftUtilsService } from 'app/shared/nft-utils.service';

@Component({
  selector: 'app-collection-detail',
  templateUrl: './collection-detail.component.html',
  styleUrls: ['./collection-detail.component.scss']
})
export class CollectionDetailComponent implements OnInit {
  activePanel: string = 'story';
  activePanel2: string = 'buy-now';
  activePanel3: string = '';
  offerId: any;
  offerPrice: any;
  offerSellerAddress: any;
  nft: any;
  username: any = 'no username available';
  defaultBio: any = 'no bio available';
  bio: any;
  avatar: any = '../../../../assets/images/avatars/brian-hughes.jpg';
  id: string;
  attributes: any[];
  colId: any;
  defaultStory: any = 'no story available';
  defaultPerks: any = 'no perks available';
  defaultFaqs: any = 'no faqs available';
  defaultTos: any = 'no terms of services available';
  story: any;
  perks: any;
  faqs: any;
  tos: any;
  constructor(
    private authService: AuthService,
    private router: Router,
    private sharedService: SharedService,
    private _cartService: CartService,
    private venlyService: VenlyService,
    private activatedRoute: ActivatedRoute,
    private productService: ProductService,
    private nftUtilsService: NftUtilsService
  ) {}

  ngOnInit(): void {
    this.sharedService.url.next(this.router.url);
    this.id = this.activatedRoute.snapshot.params['id'];
    const contractAddress = this.activatedRoute.snapshot.params['contractAddress'];
    const tokenId = this.activatedRoute.snapshot.params['tokenId'];
    if (this.id) {
      this.collectionPage();
    } else if (contractAddress && tokenId) {
      this.nftPage(contractAddress, tokenId);
    }
  }

  _commonSetup() {
    const attributes = [];
    this.nft.attributes.map((attr) => {
      if (attr.name !== 'story' && attr.name !== 'perks' && attr.name !== 'faqs' && attr.name !== 'tos') {
        attributes.push(attr);
      }
    });
    this.attributes = attributes;
    this.colId = this.nft.contract.media?.find((x) => x.type === 'collectionId')?.value; //media[1]?.value;
    const nftStory = this.nft.attributes?.find((x) => x.name === 'story');
    if (nftStory !== undefined && nftStory !== '' && nftStory !== null) {
      this.faqs = this.nft.attributes?.find((x) => x.name === 'faqs');
      this.story = nftStory;
      this.tos = this.nft.attributes?.find((x) => x.name === 'tos');
    } else {
      this.story = this.nft.contract.media?.find((x) => x.type === 'story');
    }

    this.perks = this.nft.attributes?.find((x) => x.name === 'perks');
    this.faqs = this.nft.attributes?.find((x) => x.name === 'faqs');
    this.tos = this.nft.attributes?.find((x) => x.name === 'tos');
    if (this.colId) {
      try {
        this.productService.getUserOfCollection(this.colId).subscribe((res) => {
          console.log(res);
          this.username = res.data.username;
          this.bio = res.data.bio;
          this.avatar = res.avatar;
        });
      } catch (err) {
        console.log('err');
      }
    }
  }

  collectionPage() {
    this.productService.specificOffer(this.id).subscribe((data) => {
      const offer = data.data;
      this.nft = offer.nft;
      this.offerId = offer.id;
      this.offerPrice = offer.price;
      this.offerSellerAddress = offer.sellerAddress;

      this._commonSetup();
    });
  }
  nftPage(contractAddress: string, tokenId: string) {
    this.venlyService.fetchNftMetadata(contractAddress, tokenId).subscribe((response: { message: string; data: VenlyNftMetadataByContractAndTokenId }) => {
      this.nft = response.data;

      this._commonSetup();
    });
  }
  imageError() {
    console.warn('Couldnt load original image; replacing will fallback.');
    this.nft.contract.imageUrl = this.nftUtilsService.getFallbackImage();
  }
  getUser(): User {
    console.log('user bio');
    console.log(this.authService.user);
    return this.authService.user;
  }

  addToCart() {
    const collection = this.nft.collectionIdentifier; // saleNFT.nft.contract.media.find((x) => x.type === 'collectionId');
    // TODO: Make this a Product and fix tests and code.
    const item = {
      _id: this.offerId,
      name: this.nft.name,
      tokenId: this.nft.id,
      image: this.nft.imageUrl,
      price: this.offerPrice,
      count: 1,
      subTotal: this.offerPrice,
      collection: collection.value,
      sellerAddress: this.offerSellerAddress
    };

    this._cartService.addItemToCart(item);
    this.router.navigateByUrl('/cart');
  }

  openPanel(name: string, panel: string) {
    if (panel === 'activePanel') {
      if (this.activePanel === '' || this.activePanel !== name) {
        this.activePanel = name;
      } else {
        this.activePanel = '';
      }
    }
    if (panel === 'activePanel2') {
      if (this.activePanel2 === '' || this.activePanel2 !== name) {
        this.activePanel2 = name;
      } else {
        this.activePanel2 = '';
      }
    }
    if (panel === 'activePanel3') {
      if (this.activePanel3 === '' || this.activePanel3 !== name) {
        this.activePanel3 = name;
      } else {
        this.activePanel3 = '';
      }
    }
  }
}
