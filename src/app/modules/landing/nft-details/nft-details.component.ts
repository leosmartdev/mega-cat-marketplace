import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { AuctionOfferResponse } from 'app/core/auction/auction';
import { CartService } from 'app/core/cart/cart.service';
import { CartItem } from 'app/core/cart/cartItem';
import { ActiveListing } from 'app/core/models/active-listing.model';
import { VenlyNftMetadataByContractAndTokenId } from 'app/core/models/venly/venly-nft-by-contract-and-token.model';
import { ProductService } from 'app/core/product/product.service';
import { VenlyService } from 'app/core/venly/venly.service';
import { NftUtilsService } from 'app/shared/nft-utils.service';

@Component({
  selector: 'app-nft-details',
  templateUrl: './nft-details.component.html',
  styleUrls: ['./nft-details.component.scss']
})
export class NftDetailsComponent implements OnInit {
  nft: VenlyNftMetadataByContractAndTokenId;

  nftId: string = null;
  sellerAddress: string = 'Seller Unavailable';
  status: string = 'SOLD';
  auctionId: string;
  isLoading: boolean = true;
  isCollectionLoading: boolean = true;
  walletAddress: string = null;
  listing: ActiveListing | any = null;
  etherscanUri = 'https://mumbai.polygonscan.com/'; // TODO: Change this to be dynamic.

  constructor(
    private productService: ProductService,
    private cartService: CartService,
    private route: ActivatedRoute,
    private venlyService: VenlyService,
    private nftUtilsService: NftUtilsService
  ) {}

  ngOnInit(): void {
    this.isLoading = true;
    const contractAddress = this.route.snapshot.params['contractAddress'];
    const tokenId = this.route.snapshot.params['tokenId'];
    this.fetchProduct(contractAddress, tokenId);
    this.route.queryParams.subscribe((params) => {
      this.auctionId = params.auction || null;
    });

    this.nftId = tokenId;
  }

  fetchProduct(contractAddress: string, tokenId: string, offerId = null) {
    this.venlyService.fetchNftMetadata(contractAddress, tokenId).subscribe((response: { message: string; data: VenlyNftMetadataByContractAndTokenId }) => {
      this.nft = response.data;
      this.isLoading = false;
    });

    // Fetch Listing/Offer information from Venly
    if (offerId != null) {
      this.productService.specificOffer(offerId).subscribe((data: { data: ActiveListing }) => {
        if (data) {
          this.listing = data.data;
          this.isLoading = false;
        } else {
          // This is not an active listing; please fetch NFT data separately.
        }
      });
    }
  }

  truncateSeller() {
    // return this.sellerAddress.slice(0, 4) + '...' + this.sellerAddress.slice(-4)
    return this.sellerAddress;
  }

  preProcessAddToCart({ id: offerId, price, sellerAddress }: AuctionOfferResponse) {
    const tokenId = this.route.snapshot.params['tokenId'];

    // TODO: Make this a Product and fix tests and code.
    const item: CartItem = {
      _id: offerId,
      collection: this.nft.contract.address,
      count: 1,
      image: this.nft.metadata.image,
      name: this.nft.metadata.name,
      price: price,
      sellerAddress: sellerAddress,
      subTotal: price,
      tokenId: tokenId
    };

    this.addToCart(item);
  }

  addToCart(item: CartItem) {
    this.cartService.addItemToCart(item);
  }

  imageError() {
    this.nft.metadata.image = this.nftUtilsService.getFallbackImage();
  }
}
