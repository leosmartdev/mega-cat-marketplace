export interface AuctionPayload {
  offerId: string;
  expirationTime: number;
  startingBid: number;
}

export interface AuctionBid {
  userId: {
    name: string;
    username: string;
  };
  bidAmount: number;
}

export enum AuctionStates {
  AWAITING = 'awaiting',
  ON_GOING = 'ongoing',
  EXPIRED = 'expired'
}

export interface AuctionResponse extends Omit<AuctionPayload, 'offerId'> {
  id: number;
  status: AuctionStates;
  ownerId: {
    name: string;
    username: string;
  };
  bids: AuctionBid[];
  winnerId?: {
    name: string;
    username: string;
  };
  isClaimed?: boolean;
}

export interface AuctionOfferResponse {
  id: string;
  price: number;
  sellerAddress: string;
}
export interface NftAuctionResponse {
  auction: AuctionResponse;
  offer?: AuctionOfferResponse;
}

export interface AuctionExpireResponse {
  winnerId?: {
    name: string;
    username: string;
  };
  status: AuctionStates.EXPIRED;
}
