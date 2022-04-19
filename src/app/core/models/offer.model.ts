import { AuctionResponse } from '../auction/auction';
import { Nft } from './nft.model';

/* Listing in MCL Marketplace */
export class Offer {
  id: string;
  nft: Nft;
  sellerId: string;
  sellerAddress: string;
  sellerNickname: string;
  startDate: Date;
  type: string;
  status: string;
  dataToSign: string;
  createdOn: Date;
  createdBy: string;
  price: number;
  currency: string;
  signed: boolean;
  modifiedBy: string;
  modifiedOn: Date;
  buyerWalletAddress: string;
  externalBuyerId: string;

  // Additional while fetching onGoingAuctionOffers
  auction?: AuctionResponse;
}
