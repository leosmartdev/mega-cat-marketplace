export interface NftProduct {
  id: string;
  tokenId: string;
  nft: Metadata;
  sellerId: string;
  sellerNickname: string;
  sellerAddress: string;
  startDate: Date;
  type: string;
  status: string;
  dataToSign: string;
  txInCustody: string;
  createdOn: Date;
  createdBy: string;
  modifiedOn: Date;
  modifiedBy: string;
  signed: boolean;
  currency: string;
  price: number;
  metadata: Metadata;
  collection: string;
}

export interface Metadata {
  id: string;
  address: string;
  chain: string;
  name: string;
  description: string;
  imageUrl: string;
  imagePreviewUrl: string;
  imageThumbnailUrl: string;
  animationUrls: any[];
  fungible: boolean;
  attributes: Attribute[];
  contract: Contract;
  collectionIdentifier: string;
  image: string;
}

export interface Attribute {
  type: string;
  name: string;
  value: string;
}

export interface Contract {
  chain: string;
  address: string;
  count: number;
  name: string;
  description: string;
  symbol: string;
  url: string;
  imageUrl: string;
  media: Media[];
  verified: boolean;
  premium: boolean;
  categories: any[];
}

export interface Media {
  type: string;
  value: string;
}
