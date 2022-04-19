import { MongoUser, User } from 'app/core/user/user.types';
import { List } from 'lodash';

export interface NftDrop {
  _id?: string;
  name: string;
  description: string;
  image: string;
  user: MongoUser | User | any;

  smartContractAddress: string;
  contractName: string;
  chain: string;
  standardTokens: number;
  premiumTokens: number;
  premiumTokenIds: string[];
  reservationNumber: number;
  currentMint: number;

  price: number; // for standard.
  currency: string;
  sections: Section[];

  mints: MintItem[];

  paymentOwner: string;
  whitelist: any;
  whitelistUrl: any;

  launchDateTime: string;
  publicDateTime: string;
}

export interface MintItem {
  tokenId: string;
  mintedOn: number;
  recipient: string;
  txHash: string;
  confirmed: boolean;
  quantity: string;
}

export interface Section {
  title: string;
  markdown: string;
}
