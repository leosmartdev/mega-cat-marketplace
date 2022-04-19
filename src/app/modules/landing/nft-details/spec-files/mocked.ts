import { Contract, Metadata, VenlyNftMetadataByContractAndTokenId } from 'app/core/models/venly/venly-nft-by-contract-and-token.model';

const contract: Contract = {
  address: 'test address',
  contractType: 'test',
  name: null,
  symbol: null,
  contractURI: null,
  metadata: null
};

const metadata: Metadata = {
  name: 'test',
  description: 'Some description',
  collection: 'test collection',
  attributes: [],
  image: 'test.png'
};

export const mockedNftMetadata: VenlyNftMetadataByContractAndTokenId = {
  contract,
  uri: 'test uri',
  metadata
};
