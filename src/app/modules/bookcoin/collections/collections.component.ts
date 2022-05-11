import { Component, OnInit } from '@angular/core';
import { Product } from 'app/core/product/product';
import { ProductService } from 'app/core/product/product.service';
import { ErrorsService } from 'app/core/errors/errors.service';
import { Router } from '@angular/router';
import { SharedService } from 'app/core/shared/shared.service';
import { CartService } from 'app/core/cart/cart.service';
import { Offer } from 'app/core/models/offer.model';
import { NftUtilsService } from 'app/shared/nft-utils.service';
import { NftCardModel } from 'app/core/models/nft-card.model';
import { AuctionResponse } from 'app/core/auction/auction';
import { AuctionService } from 'app/core/auction/auction.service';

enum ListingCategory {
  SALE = 'buy',
  AUCTION = 'auction'
}

interface NftAuctionModel {
  nft: NftCardModel;
  auction?: AuctionResponse;
}

@Component({
  selector: 'app-collections',
  templateUrl: './collections.component.html',
  styleUrls: ['./collections.component.scss']
})
export class CollectionsComponent implements OnInit {
  products: NftAuctionModel[] = [];
  saleNFTs: NftCardModel[] = [];
  filteredNFt: NftAuctionModel[] = [];

  ListingCategoryType = ListingCategory;
  listingCategory: ListingCategory = ListingCategory.SALE;
  activePanel: string = '';
  /*eslint-disable */
  SaleType: string = 'buy';
  Collection: any = 'all';
  ExistCollections: string[] = [];
  PriceType: any = {};
  /*eslint-enable */

  pricefilterValue: string = 'All';
  isFetching: boolean = true;
  constructor(
    private productService: ProductService,
    private errorsService: ErrorsService,
    private _cartService: CartService,
    private sharedService: SharedService,
    private router: Router,
    private nftUtilsService: NftUtilsService,
    private auctionService: AuctionService
  ) {}

  ngOnInit(): void {
    this.sharedService.url.next(this.router.url);
    // this.getSaleNFTs();
    this.getListing();
  }

  getListing() {
    this.products = [];
    this.saleNFTs = [];
    this.filteredNFt = [];
    this.isFetching = true;
    if (this.SaleType === ListingCategory.SALE) {
      this.getSaleListing();
    } else {
      this.getAuctionListing();
    }
    this.isFetching = false;
  }
  getAuctionListing(): void {
    this.auctionService.getOnGoingAuctions().subscribe(this.processListingResponse, () => {
      this.errorsService.openSnackBar('Something went wrong!', 'Error');
    });
  }
  getSaleListing(): void {
    this.productService.getAllReadyListings().subscribe(this.processListingResponse, () => {
      this.errorsService.openSnackBar('Something went wrong!', 'Error');
    });
  }

  private processListingResponse = (data: { data: Offer[] }) => {
    const distinctCollections = [];
    const listings = data.data;

    const marketplaceType = this.SaleType === ListingCategory.SALE ? 'listing-buynow' : 'listing-auction';
    listings.forEach((offer: Offer) => {
      const nftCard = this.nftUtilsService.buildNftCardFromVenlyOffer({ offer, marketplaceType });

      if (distinctCollections.indexOf(offer.nft.contract.address) === -1) {
        distinctCollections.push(offer.nft.contract.address);
        this.ExistCollections.push(offer.nft.contract.name);
      }
      this.products.push({ nft: nftCard });
      this.saleNFTs.push(nftCard);

      this.filteredNFt.push({
        nft: nftCard,
        auction: marketplaceType === 'listing-auction' ? offer.auction : undefined
      });
    });

    console.log(`Found ${this.products.length} products across ${distinctCollections.length} collections`);
  };

  /*eslint-disable */
  // LatestFilter(arr) {
  //   /*eslint-enable */

  //   this.latest = arr.filter;
  // }
  /*eslint-disable */
  PriceFilter(val, filtered) {
    /*eslint-enable */
    this.isFetching = true;
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
    if (filtered === 'type') {
      this.getListing();
      /*eslint-disable */
      this.Collection = 'all';
      /*eslint-enable */

      this.pricefilterValue = 'All';
    }
    this.filteredNFt = [];
    const marketplaceType = this.SaleType === ListingCategory.SALE ? 'listing-buynow' : 'listing-auction';
    this.saleNFTs.forEach((saleNFT: any) => {
      if (
        ((this.Collection === 'all' || this.Collection.collection === saleNFT.contract.name) && this.pricefilterValue === 'All') ||
        (this.PriceType.initial <= saleNFT.listing.price && this.PriceType.final > saleNFT.listing.price) ||
        (this.pricefilterValue === 'Greater Than 100' && this.PriceType.initial <= saleNFT.listing.price)
      ) {
        this.filteredNFt.push({
          nft: saleNFT,
          auction: marketplaceType === 'listing-auction' ? saleNFT.auction : undefined
        });
      }
    });
    this.isFetching = false;
  }
}
