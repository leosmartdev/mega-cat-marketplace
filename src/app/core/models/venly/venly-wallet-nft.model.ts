import { Contract } from '../contract.model';

/* eslint-disable @typescript-eslint/naming-convention */
export interface VenlyWalletNft {
  id: string;
  name: string;
  description: string;
  url: null;
  backgroundColor: null;
  imageUrl: string;
  imagePreviewUrl: string;
  imageThumbnailUrl: string;
  animationUrl: null;
  animationUrls: any[];
  fungible: boolean;
  contract: Contract;
  attributes: Attribute[];
  balance: number;
  finalBalance: number;
  chain?: string;
}

export interface Attribute {
  type: string;
  name: string;
  value: string;
  displayType: null;
  traitCount: null;
  maxValue: null;
}
