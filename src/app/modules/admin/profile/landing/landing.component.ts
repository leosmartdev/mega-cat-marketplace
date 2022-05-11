import { NftUtilsService } from './../../../../shared/nft-utils.service';
import { Component, NgZone, OnInit } from '@angular/core';
import { AuthService } from 'app/core/auth/auth.service';
import { ErrorsService } from 'app/core/errors/errors.service';
import { NftCardModel } from 'app/core/models/nft-card.model';
import { Offer } from 'app/core/models/offer.model';
import { VenlyWalletNft } from 'app/core/models/venly/venly-wallet-nft.model';
import { ProductService } from 'app/core/product/product.service';
import { User } from 'app/core/user/user.types';
import { VenlyService } from 'app/core/venly/venly.service';
import { WalletService } from 'app/core/wallet/wallet.service';
import { ActivatedRoute } from '@angular/router';
import { AuctionService } from 'app/core/auction/auction.service';

interface NftAuctionModel {
  nft: NftCardModel;
  auction?: any;
}

@Component({
  selector: 'app-landing',
  templateUrl: './landing.component.html',
  styleUrls: ['./landing.component.scss']
})
export class LandingComponent implements OnInit {
  user: User;
  filteredNFTs: NftAuctionModel[] = [];
  isFetching: boolean = true;
  nfts: NftAuctionModel[] = [];
  walletAddress: string;
  term: string = '';
  loading: boolean = false;
  selectedOption: string = 'Filter List';
  isSelecting: boolean = false;
  isUserAuctions: boolean = false;
  isParticipatedAuctions: boolean = false;
  userAuctionNfts = [];
  ParticipatedAuctionNfts = [];

  constructor(
    private productService: ProductService,
    private errorsService: ErrorsService,
    private nftUtilsService: NftUtilsService,
    public walletService: WalletService,
    private ngZone: NgZone,
    private authService: AuthService,
    private route: ActivatedRoute,
    private auctionService: AuctionService
  ) {}

  ngOnInit(): void {
    this.route.data.subscribe((res) => {
      this.isUserAuctions = res.isUserAuction || false;
      this.isParticipatedAuctions = res.isParticipatedAuction || false;
    });
    this.user = this.authService.user;
    this.setWalletAddress();

    if (this.isParticipatedAuctions) {
      this.getAuctionsParticipatedByUser();
    } else if (this.isUserAuctions) {
      this.getAuctionsCreatedByUser();
    } else {
      this.getNFTsForWallet();
      // no need to call now, as venly have no such states e.g. AWAITING_FINALIZING_OFFER,FINALIZING_OFFER
      // this.getPendingOffers();
    }
  }

  setWalletAddress() {
    this.walletService.getAccounts().subscribe((accounts) => {
      this.ngZone.run(() => {
        if (accounts.length === 0) {
          this.walletAddress = null;
        } else {
          this.walletAddress = accounts[0];
        }
      });
    });
  }

  /** This function retrieves all NFTs that are due to the wallet address (purchased by) but have not yet been transferred. */
  getPendingOffers() {
    this.productService.getAllListings().subscribe(
      (data: { data: Offer[] }) => {
        const distinctCollections = [];
        const pendingListings = data.data.filter(
          (listing: Offer) =>
            listing.status === 'AWAITING_FINALIZING_OFFER' ||
            (listing.status === 'FINALIZING_OFFER' && (listing.buyerWalletAddress === this.walletAddress || listing.externalBuyerId === this.user.id))
        );

        pendingListings.forEach((offer: Offer) => {
          const nftCard = this.nftUtilsService.buildNftCardFromVenlyOffer({ offer, marketplaceType: 'owned-pending' });

          if (distinctCollections.indexOf(offer.nft.contract.address) === -1) {
            distinctCollections.push(offer.nft.contract.address);
          }

          this.nfts.push({ nft: nftCard });
        });
      },
      () => {
        console.error('Error fetching pending listings for user');
      }
    );
  }

  getNFTsForWallet(): void {
    let pendingOffersForUser: any[] = [];
    this.isFetching = true;
    this.filteredNFTs = [];

    this.productService.getAllListings('INITIATING_OFFER', true).subscribe((list) => {
      pendingOffersForUser = list.data.filter((listing: Offer) => listing.sellerAddress === this.walletAddress);

      this.productService.listingNFT().subscribe(
        (data) => {
          if (Boolean(data.data) === false) {
            this.nfts = [];
            this.filteredNFTs = this.nfts;
            this.isFetching = false;
            return;
          }
          data.data.forEach((nft: VenlyWalletNft) => {
            const nftCard = this.nftUtilsService.buildNftCardFromVenlyWalletNft(nft);
            if (
              !pendingOffersForUser.some((listing) => listing.nft.id === nftCard.tokenId && listing.nft.contract.address === nftCard.contract.address) &&
              !this.nfts.some((listing) => listing.nft.tokenId === nftCard.tokenId && listing.nft.contract.address === nftCard.contract.address)
            ) {
              this.nfts.push({ nft: nftCard });
            }
          });
          this.filteredNFTs = this.nfts;
          this.isFetching = false;
          pendingOffersForUser.forEach((offer) => {
            const nft = this.nftUtilsService.buildNftCardFromVenlyOffer({ offer, marketplaceType: 'listing-pending' });
            this.filteredNFTs.push({ nft });
          });
        },
        () => {
          this.errorsService.openSnackBar('Something went wrong!', 'Error');
        }
      );
    });
  }

  getAuctionsParticipatedByUser() {
    this.isFetching = true;
    this.auctionService.getAllParticipatedByUser().subscribe((res) => {
      this.processAuctionsResponse(res.data);
    });
  }

  getAuctionsCreatedByUser() {
    this.isFetching = true;
    this.auctionService.getAllCreatedByUser().subscribe((res) => {
      this.processAuctionsResponse(res.data);
    });
  }

  processAuctionsResponse(auctions: Offer[]) {
    auctions.forEach((offer: Offer) => {
      const nftCard = this.nftUtilsService.buildNftCardFromVenlyOffer({ offer, marketplaceType: 'listing-auction' });
      this.filteredNFTs.push({ nft: nftCard, auction: offer.auction });
    });
    this.isFetching = false;
  }

  search() {
    console.log(this.term);
    this.filteredNFTs = this.nfts.filter((o) => o.nft.name.toLowerCase().includes(this.term.toLowerCase()));
    console.log(this.filteredNFTs);
  }

  selectingFilter() {
    this.isSelecting = !this.isSelecting;
  }

  selectFilter(selected: string) {
    this.selectedOption = selected;
    this.isSelecting = false;
    // TODO: Replace with proper endpoints
    switch (selected) {
      case 'Inventory': {
        // get all
        // sample only, replace if needed
        break;
      }
      case 'My Listings': {
        // get filtered list;
        break;
      }
      case 'My Auctions': {
        break;
      }
      case 'Sold': {
        break;
      }
      case 'Bought': {
        break;
      }
      case 'Collections': {
        break;
      }
    }
  }
}
