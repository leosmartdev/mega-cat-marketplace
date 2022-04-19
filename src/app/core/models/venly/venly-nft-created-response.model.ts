/* eslint-disable @typescript-eslint/naming-convention */
export class VenlyNftCreatedResponse {
  transactionHash: string;
  metadata: Metadata;
  destinations: string[];
  tokenIds: number[];
}

export class Metadata {
  name: string;
  description: string;
  image: string;
  imagePreview: string;
  imageThumbnail: string;
  backgroundColor: string;
  background_color: string;
  externalUrl: string;
  external_url: string;
  animationUrls: any[];
  attributes: Attribute[];
  contract: Contract;
  asset_contract: Contract;
  fungible: boolean;
}

export class Contract {
  address: string;
  name: string;
  symbol: string;
  image: string;
  imageUrl: string;
  image_url: string;
  description: string;
  externalLink: string;
  external_link: string;
  externalUrl: string;
  external_url: string;
  media: Media[];
  type: string;
}

export interface Media {
  type: string;
  value: string;
}

export class Attribute {
  type: string;
  name: string;
  value: string;
  traitType: string;
  trait_type: string;
}
