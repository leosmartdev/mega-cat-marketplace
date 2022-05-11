import { MetadataAttribute } from './attribute.model';
import { Contract } from './contract.model';

export class Nft {
  address: string;
  attributes: MetadataAttribute[];
  chain: string;
  contract: Contract;
  description: string;
  id: string;
  imagePreviewUrl: string;
  imageThumbnailUrl: string;
  imageUrl: string;
  name: string;
  tokenId?: string;
  url: string;
}
