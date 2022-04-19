import { MetadataAttribute } from './attribute.model';
import { Contract } from './contract.model';

export class Nft {
  id: string;
  tokenId?: string;
  address: string;
  chain: string;
  name: string;
  description: string;
  imageUrl: string;
  url: string;
  imagePreviewUrl: string;
  imageThumbnailUrl: string;
  attributes: MetadataAttribute[];
  contract: Contract;
  collectionIdentifier: string;
}
