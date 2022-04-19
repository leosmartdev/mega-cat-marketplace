import { Component, OnInit } from '@angular/core';
import { NftUtilsService } from 'app/shared/nft-utils.service';
import { AuctionService } from 'app/core/auction/auction.service';
import { Offer } from 'app/core/models/offer.model';
import { AuthService } from 'app/core/auth/auth.service';

@Component({
  selector: 'app-participated-auctions',
  templateUrl: './participated-auctions.component.html',
  styleUrls: ['./participated-auctions.component.scss']
})
export class ParticipatedAuctionsComponent implements OnInit {
  filteredNFTs: any[] = [];
  isAdmin: boolean = false;
  isFetching: boolean = true;

  constructor(private auctionService: AuctionService, private authService: AuthService, private nftUtilsService: NftUtilsService) {}

  ngOnInit(): void {
    this.getAuctionsParticipatedByUser();
    this.isAdmin = this.authService.isAdmin();
  }

  getAuctionsParticipatedByUser() {
    this.isFetching = true;
    this.auctionService.getAllParticipatedByUser().subscribe((res) => {
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
