export interface Product {
  _id: string;
  name: string;
  description: string;
  tokenId: string;
  metadataStatus: string;
  properties: [];
  images: [];
  price: number;
  createdOn: string;
  nft: {
    name: string;
    description: string;
    owner?: string;
    tokenId: string;
  };
  metadata?;
  type?;
  collection?;
}
