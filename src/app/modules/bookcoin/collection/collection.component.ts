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
  colId: any;
  aboutCol: any = '';
  defaultStory: any = 'no story available';
  defaultPerks: any = 'no perks available';
  story: any = '';
  perks: any = '';
  subheadCol: any = '';
  filteredNFtsToDisplay: NftAuctionModel[] = [];
  currentCount: number = 6;
  colDate: any;
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
    //this.getSaleNFTs();
    this.homepageService.getDrops().subscribe((data) => {
      this.cards = data.data;
      this.cards = this.cards.slice(0, 1);
    });
    this.getSaleListing();
    this.getAuctionListing();
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

  getSaleNFTs(): void {
    this.productService.getAllListings().subscribe(
      (data: { data: Offer[] }) => {
        const distinctCollections = [];
        const listings = data.data.filter((listing: Offer) => listing.status === 'READY');

        listings.forEach((offer: Offer) => {
          if (offer.nft.contract.address === this.id) {
            if (offer.nft.contract.media !== null && offer.nft.contract.media.find((x) => x.type === 'collectionId') !== undefined) {
              this.offer = offer;
              const listing: any = Object.assign({}, offer);
              listing.metadata = offer.nft;
              listing.type = 'buy-now';
              listing.metadata.image = offer.nft.imageUrl;
              const contract = offer.nft.contract;
              const contractAddress = contract.address;

              listing.collection = contract.name;
              listing.tokenId = offer.nft.id;
              this.priceArray.push(offer.price);

              if (this.sellers.indexOf(offer.sellerAddress) === -1) {
                this.sellers.push(offer.sellerAddress);
              }

              if (distinctCollections.indexOf(contract.address) === -1) {
                distinctCollections.push(contractAddress);
              }
              this.products.push(listing);
              this.saleNFTs.push(listing);
              this.filteredNFts.push(listing);
              this.colId = offer.nft.contract.media.find((x) => x.type === 'collectionId').value;
            }
          }
        });
        //this.colId = this.offer.nft.contract.media.find((x) => x.type === 'collectionId').value;
        this.aboutCol = this.offer.nft.contract.media.find((x) => x.type === 'about');
        this.subheadCol = this.offer.nft.contract.media.find((x) => x.type === 'subheading');
        this.story = this.offer.nft.contract.media.find((x) => x.type === 'story');
        this.perks = this.offer.nft.contract.media.find((x) => x.type === 'perks');
        this.productService.getUserOfCollection(this.colId).subscribe((res) => {
          this.username = res.data.username;
          this.avatar = res.avatar;
        });
        this.floorPrice = Math.min(...this.priceArray);

        this.filteredNFtsToDisplay = this.filteredNFts.slice(0, this.currentCount);
      },
      () => {
        this.errorsService.openSnackBar('Something went wrong!', 'Error');
      }
    );
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

    this.colId = this.offer.nft.contract.media?.find((x) => x.type === 'collectionId').value;
    this.aboutCol = this.offer.nft.contract.media?.find((x) => x.type === 'about');
    this.subheadCol = this.offer.nft.contract.media?.find((x) => x.type === 'subheading');
    this.story = this.offer.nft.contract.media?.find((x) => x.type === 'story');
    this.perks = this.offer.nft.contract.media?.find((x) => x.type === 'perks');
    this.productService.getUserOfCollection(this.colId).subscribe((res) => {
      this.username = res.data.username;
      this.colDate = res.date;
      this.colDate = this.colDate.slice(0, 10);
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
    this.colId = this.offer.nft.contract.media.find((x) => x.type === 'collectionId').value;
    this.aboutCol = this.offer.nft.contract.media.find((x) => x.type === 'about');
    this.subheadCol = this.offer.nft.contract.media.find((x) => x.type === 'subheading');
    this.story = this.offer.nft.contract.media.find((x) => x.type === 'story');
    this.perks = this.offer.nft.contract.media.find((x) => x.type === 'perks');
    this.productService.getUserOfCollection(this.colId).subscribe((res) => {
      this.username = res.data.username;
    });
    this.floorPrice = Math.min(...this.priceArray);
  };
}
