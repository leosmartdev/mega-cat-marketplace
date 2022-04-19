export interface VenlyNftMetadataByContractAndTokenId {
  contract: Contract;
  uri: string;
  metadata: Metadata;
}

export interface Contract {
  address: string;
  contractType: string;
  name: null;
  symbol: null;
  contractURI: null;
  metadata: null;
}

export interface Metadata {
  name: string;
  description: string;
  collection: string;
  attributes: Attribute[];
  image: string;
}

/*eslint-disable */
export interface Attribute {
  display_type?: string;
  trait_type: string;
  value: number | string;
  max_value?: number;
}
/*eslint-enable */
