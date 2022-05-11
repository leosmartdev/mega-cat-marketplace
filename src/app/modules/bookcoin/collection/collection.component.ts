import { Component, OnInit } from '@angular/core';
import { Product } from 'app/core/product/product';
import { ProductService } from 'app/core/product/product.service';
import { ErrorsService } from 'app/core/errors/errors.service';
import { ActivatedRoute, Router } from '@angular/router';
import { SharedService } from 'app/core/shared/shared.service';
import { CartService } from 'app/core/cart/cart.service';
import { Offer } from 'app/core/models/offer.model';
import { NftUtilsService } from 'app/shared/nft-utils.service';
import { HomepageService } from 'app/core/homepage/homepage.service';
import { NftCardModel } from 'app/core/models/nft-card.model';
import { AuctionResponse } from 'app/core/auction/auction';
import { AuctionService } from 'app/core/auction/auction.service';
import { environment } from 'environments/environment';

export interface NftAuctionModel {
  nft: NftCardModel;
  auction?: AuctionResponse;
}

@Component({
  selector: 'app-collection',
  templateUrl: './collection.component.html',
  styleUrls: ['./collection.component.scss']
})
export class CollectionComponent implements OnInit {
  saleNFTs: Product[] = [];
  products: Product[] = [];
  activePanel: string = 'about-collection';
  offer: Offer;
  cards: any = [];
  /*eslint-disable */
  SaleType: string = 'buy';
  id: string;
  sellers = [];
  PriceType: any = {};
  priceArray = [];
  floorPrice: number = 0;
  /*eslint-enable */
  pricefilterValue: string = 'All';
  filteredNFts: NftAuctionModel[] = [];
  auctionNfts: NftAuctionModel[] = [];
  username: any = 'no username available';
  avatar: any = '../../../../assets/images/avatars/brian-hughes.jpg';
  aboutCol: any = '';
  defaultStory: any = 'no story available';
  defaultPerks: any = 'no perks available';
  filteredNFtsToDisplay: NftAuctionModel[] = [];
  currentCount: number = 6;
  colDate: any;
  collection: any = {
    subheading: '',
    name: '',
    about: '',
    imageUrl: '',
    description: '',
    story: '',
    perks: ''
  };

  constructor(
    private productService: ProductService,
    private errorsService: ErrorsService,
    private _cartService: CartService,
    private sharedService: SharedService,
    private router: Router,
    private nftUtilsService: NftUtilsService,
    private activatedRoute: ActivatedRoute,
    private homepageService: HomepageService,
    private auctionService: AuctionService
  ) {}

  ngOnInit(): void {
    this.sharedService.url.next(this.router.url);
    this.id = this.activatedRoute.snapshot.params['id'];
    this.homepageService.getDrops().subscribe((data) => {
      this.cards = data.data;
      this.cards = this.cards.slice(0, 1);
    });
    this.getCollection();
  }

  getAuctionListing(): void {
    this.auctionService.getOnGoingAuctions().subscribe(this.processAuctionResponse, () => {
      this.errorsService.openSnackBar('Something went wrong!', 'Error');
    });
  }

  getSaleListing(): void {
    this.productService.getAllReadyListings().subscribe(this.processListingResponse, () => {
      this.errorsService.openSnackBar('Something went wrong!', 'Error');
    });
  }

  getCollection(): void {
    const chain = this.router.url.includes('/collection/p/') ? environment.polygonChain : environment.ethereumChain;
    this.productService.getCollectionDetail(this.id, chain).subscribe(
      (response) => {
        console.log('Successfully imported a collection', response);
        this.collection.name = response.data.name;
        this.collection.subheading = response.data.subheading;
        this.collection.about = response.data.about;
        this.collection.story = response.data.story;
        this.collection.perks = response.data.perks;
        this.collection.imageUrl = response.data.imageUrl;
        this.collection.description = response.data.description;
        this.username = response.data.userId.username;
        this.avatar = response.data.userId.avatar;
        this.colDate = response.data.createdAt;
        this.colDate = this.colDate.slice(0, 10);
        if (!response.data.isImported) {
          this.getSaleListing();
          this.getAuctionListing();
        }
      },
      () => {
        this.errorsService.openSnackBar('Something went wrong!', 'Error');
      }
    );
  }

  loadMore() {
    if (this.filteredNFts.length < this.currentCount + 3) {
      const diff = this.currentCount + 3 - this.filteredNFts.length;
      this.currentCount = this.currentCount + (3 - diff);
    } else {
      this.currentCount = this.currentCount + 3;
    }
    this.filteredNFtsToDisplay = this.filteredNFts.slice(0, this.currentCount);
  }
  imageError(nft) {
    nft.imageUrl = this.nftUtilsService.getFallbackImage();
  }
  /*eslint-disable */
  PriceFilter(val, filtered) {
    /*eslint-enable */
    if (filtered === 'price') {
      if (val === 'Less Than 50') {
        this.PriceType['initial'] = 0;
        this.PriceType['final'] = 50;
      } else if (val === '50-100') {
        this.PriceType['initial'] = 50;
        this.PriceType['final'] = 100;
      } else if (val === 'Greater Than 100') {
        this.PriceType['initial'] = 100;
        this.PriceType['final'] = 500;
      }
    }
    this.filteredNFts = [];
    this.saleNFTs.forEach((saleNFT: any) => {
      if (
        this.pricefilterValue === 'All' ||
        (this.PriceType.initial <= saleNFT.price && this.PriceType.final > saleNFT.price) ||
        (this.pricefilterValue === 'Greater Than 100' && this.PriceType.initial <= saleNFT.price)
      ) {
        this.filteredNFts.push(saleNFT);
      }
    });
    this.filteredNFtsToDisplay = this.filteredNFts.slice(0, this.currentCount);
  }

  addToCart(saleNFT: any) {
    // TODO: Make this a Product and fix tests and code.
    const item = {
      _id: saleNFT.id,
      count: 1,
      image: saleNFT.nft.imageUrl,
      name: saleNFT.nft.name,
      price: saleNFT.price,
      sellerAddress: saleNFT.sellerAddress,
      smartContractAddress: saleNFT.nft.contract.address,
      subTotal: saleNFT.price,
      tokenId: saleNFT.nft.tokenId
    };

    this._cartService.addItemToCart(item);
  }
  openPanel(name: string) {
    if (this.activePanel === '' || this.activePanel !== name) {
      this.activePanel = name;
    } else {
      this.activePanel = '';
    }
  }

  private processListingResponse = (data: { data: Offer[] }) => {
    const listings = data.data;

    const marketplaceType = 'listing-buynow';
    listings.forEach((offer: Offer) => {
      if (offer.nft.contract.address === this.id) {
        const nftCard = this.nftUtilsService.buildNftCardFromVenlyOffer({ offer, marketplaceType });
        this.offer = offer;
        this.priceArray.push(offer.price);

        if (this.sellers.indexOf(offer.sellerAddress) === -1) {
          this.sellers.push(offer.sellerAddress);
        }
        this.filteredNFts.push({
          nft: nftCard,
          auction: undefined
        });
      }
    });

    this.floorPrice = Math.min(...this.priceArray);
    this.filteredNFtsToDisplay = this.filteredNFts.slice(0, this.currentCount);
  };
  private processAuctionResponse = (data: { data: Offer[] }) => {
    const listings = data.data;

    const marketplaceType = 'listing-auction';
    listings.forEach((offer: Offer) => {
      if (offer.nft.contract.address === this.id) {
        const nftCard = this.nftUtilsService.buildNftCardFromVenlyOffer({ offer, marketplaceType });
        this.offer = offer;
        this.priceArray.push(offer.price);

        if (this.sellers.indexOf(offer.sellerAddress) === -1) {
          this.sellers.push(offer.sellerAddress);
        }
        this.auctionNfts.push({
          nft: nftCard,
          auction: offer.auction
        });
      }
    });

    this.floorPrice = Math.min(...this.priceArray);
  };
}
