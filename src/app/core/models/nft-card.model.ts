import { Offer } from './offer.model';
import { Attribute, MetadataAttribute } from './attribute.model';
import { AuctionResponse } from '../auction/auction';

export interface NftCardModel {
  tokenId: string;
  name: string;
  description: string;
  image: string;
  metadata: Attribute[] | MetadataAttribute[];
  chain?: string;
  contract: Contract;

  marketplace: Marketplace;

  auction?: AuctionResponse;
  // Does the NFT have an associated Listing? (Venly: Offer)
  listing?: Offer;
}

export interface Contract {
  name: string;
  chain: string;
  address: string;
  media: any[];

  type?: string;
  url?: string;
  imageUrl?: string;
}

export interface Marketplace {
  // Used to toggle various functionality
  type: string; // owned, owned-pending, listing-buynow, listing-auction, listing-pending
}

// TODO: Determine if this needs used.
export interface Listing {
  sellerAddress: string;
  sellerNickname: string;
  status: string;
  currency: string;
  price: number;
  collection: string;
}

export interface Media {
  type: string;
  value: string;
}
