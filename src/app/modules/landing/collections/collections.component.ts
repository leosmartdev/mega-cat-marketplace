import { NftCardModel } from './../../../core/models/nft-card.model';
import { NftUtilsService } from './../../../shared/nft-utils.service';
import { Component, OnInit } from '@angular/core';
import { ProductService } from 'app/core/product/product.service';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { BsModalRef } from 'ngx-bootstrap/modal';
import { CartService } from 'app/core/cart/cart.service';
import { ErrorsService } from 'app/core/errors/errors.service';
import { Offer } from 'app/core/models/offer.model';
import { AuctionService } from 'app/core/auction/auction.service';
import { AuctionResponse } from 'app/core/auction/auction';

enum ListingCategory {
  SALE = 'sale',
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
export class LandingCollectionsComponent implements OnInit {
  products: NftAuctionModel[] = [];
  saleNFTs: NftCardModel[] = [];
  filteredNFt: NftAuctionModel[] = [];

  ListingCategoryType = ListingCategory;
  listingCategory: ListingCategory = ListingCategory.SALE;

  searchForm: FormGroup;
  layout: string = 'large';
  sort: string = '';
  filter = {
    toggle: true,
    status: {
      toggle: true,
      listingCategory: ListingCategory.SALE
    },
    price: {
      toggle: false,
      from: null,
      to: null
    }
  };
  public modalRef: BsModalRef;

  maxValue: string = '0';
  minValue: string = '0';

  constructor(
    private formBuilder: FormBuilder,
    private productService: ProductService,
    private auctionService: AuctionService,
    private cartService: CartService,
    private errorsService: ErrorsService,
    private nftUtilsService: NftUtilsService
  ) {}

  ngOnInit(): void {
    //Search Form
    this.searchForm = this.formBuilder.group({
      search: ['', Validators.required]
    });

    this.getListing();
  }

  category(category: ListingCategory) {
    this.filter.status.listingCategory = category;
    this.getListing();
  }

  priceFilter() {
    this.filteredNFt = [];
    console.log(this.maxValue, this.minValue);
    this.products.forEach((saleNFT: any) => {
      if (this.minValue <= saleNFT.nft.listing.price && this.maxValue >= saleNFT.nft.listing.price) {
        this.filteredNFt.push(saleNFT);
      }
    });
  }

  getListing() {
    this.products = [];
    this.saleNFTs = [];
    this.filteredNFt = [];
    if (this.filter.status.listingCategory === ListingCategory.SALE) {
      this.getSaleListing();
    } else {
      this.getAuctionListing();
    }
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

  //Search Products
  searchProducts(): void {
    if (this.searchForm.value.search !== '') {
      const filteredNFTs = this.filteredNFt.filter((element: NftAuctionModel) => element.nft.name.toLowerCase().indexOf(this.searchForm.value.search.toLowerCase()) > -1);
      this.filteredNFt = filteredNFTs;
    } else {
      this.filteredNFt = this.products;
    }
  }

  //Filter Products
  filterProducts(): void {
    switch (this.sort) {
      case 'Listings(Latest)':
        this.filteredNFt.sort((a: NftAuctionModel, b: NftAuctionModel) => {
          if (b.nft.listing.createdOn > a.nft.listing.createdOn) {
            return 1;
          }
          if (b.nft.listing.createdOn < a.nft.listing.createdOn) {
            return -1;
          }
        });
        break;
      case 'Listings(Oldest)':
        this.filteredNFt.sort((a: NftAuctionModel, b: NftAuctionModel) => {
          if (a.nft.listing.createdOn > b.nft.listing.createdOn) {
            return 1;
          }
          if (a.nft.listing.createdOn < b.nft.listing.createdOn) {
            return -1;
          }
        });
        break;
      case 'Price(Highest)':
        this.filteredNFt = this.filteredNFt.sort((a: NftAuctionModel, b: NftAuctionModel) => Number(b.nft.listing.price) - Number(a.nft.listing.price));
        break;
      case 'Price(Lowest)':
        this.filteredNFt = this.filteredNFt.sort((a: NftAuctionModel, b: NftAuctionModel) => Number(a.nft.listing.price) - Number(b.nft.listing.price));
        break;
      default:
    }
  }

  handleInputChange(): void {
    if (this.searchForm.value.search !== '') {
      const filteredNFTs = this.products.filter((element: NftAuctionModel) => element.nft.name.toLowerCase().indexOf(this.searchForm.value.search.toLowerCase()) > -1);
      this.filteredNFt = filteredNFTs;
    } else {
      this.filteredNFt = this.products;
    }
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
      sellerAddress: saleNFT.sellerAddress,
      smartContractAddress: saleNFT.nft.contract.address
    };

    this.cartService.addItemToCart(item);
  }

  private processListingResponse = (data: { data: Offer[] }) => {
    const distinctCollections = [];
    const listings = data.data;

    const marketplaceType = this.filter.status.listingCategory === ListingCategory.SALE ? 'listing-buynow' : 'listing-auction';
    listings.forEach((offer: Offer) => {
      const nftCard = this.nftUtilsService.buildNftCardFromVenlyOffer({ offer, marketplaceType });

      if (distinctCollections.indexOf(offer.nft.contract.address) === -1) {
        distinctCollections.push(offer.nft.contract.address);
      }
      this.products.push({
        nft: nftCard,
        auction: marketplaceType === 'listing-auction' ? offer.auction : undefined
      });
      this.saleNFTs.push(nftCard);

      this.filteredNFt.push({
        nft: nftCard,
        auction: marketplaceType === 'listing-auction' ? offer.auction : undefined
      });
    });

    console.log(`Found ${this.products.length} products across ${distinctCollections.length} collections`);
  };
}
