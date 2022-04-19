import { Component, OnInit } from '@angular/core';
import { AuthService } from 'app/core/auth/auth.service';
import { User } from '../../../../core/user/user.types';
import { NftUtilsService } from 'app/shared/nft-utils.service';
import { AuctionService } from 'app/core/auction/auction.service';
import { Offer } from 'app/core/models/offer.model';

@Component({
  selector: 'app-my-auctions',
  templateUrl: './my-auctions.component.html',
  styleUrls: ['./my-auctions.component.scss']
})
export class MyAuctionsComponent implements OnInit {
  nfts: any[] = [];
  filteredNFTs: any[] = [];
  isAdmin: boolean = false;
  isFetching: boolean = true;

  constructor(private nftUtilsService: NftUtilsService, private authService: AuthService, private auctionService: AuctionService) {}

  ngOnInit(): void {
    this.getAuctionsCreatedByUser();
    this.isAdmin = this.authService.isAdmin();
  }

  imageError(nft) {
    nft.imageUrl = this.nftUtilsService.getFallbackImage();
  }

  getUser(): User {
    return this.authService.user;
  }

  getAuctionsCreatedByUser() {
    this.isFetching = true;
    this.auctionService.getAllCreatedByUser().subscribe((res) => {
      this.processAuctionsResponse(res.data);
      this.isFetching = false;
    });
  }

  processAuctionsResponse(auctions: Offer[]) {
    auctions.forEach((offer: Offer) => {
      const nftCard = this.nftUtilsService.buildNftCardFromVenlyOffer({ offer, marketplaceType: 'listing-auction' });
      this.filteredNFTs.push({ nft: nftCard, auction: offer.auction });
    });
  }
}
