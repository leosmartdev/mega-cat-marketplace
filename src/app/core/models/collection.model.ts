export interface CollectionModel {
  name: string;
  ownerAddress: string;
  venlyCollectionId?: string;
  collectionId?: string; // to support old data
  smartContractAddress: string | null;
  chain: string;
  subheading?: string;
  about?: string;
  royality?: string;
  story?: string;
  perks?: string;
  lottie?: string | null;
  rewards?: Reward[];
  userId: any;
  createdAt: Date;
}

export interface Reward {
  title: string;
  markdown: string;
}
