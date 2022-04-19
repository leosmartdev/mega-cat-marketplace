import { mockedNft, mockedNftCard } from 'app/core/auction/spec-files/mocked';
import { Contract, Metadata, VenlyNftCreatedResponse } from 'app/core/models/venly/venly-nft-created-response.model';
import { Product } from 'app/core/product/product';

export const mockedProduct: Product = {
  _id: '123',
  name: 'test',
  description: 'Some description',
  tokenId: '456',
  metadataStatus: 'active',
  properties: [],
  images: [],
  price: 10,
  createdOn: '',
  nft: {
    name: 'Test Nft',
    description: 'Some description',
    owner: 'Joh Doe',
    tokenId: '456'
  }
};

const contract: Contract = {
  address: 'test address',
  name: 'test',
  symbol: 'test',
  image: 'test.png',
  imageUrl: 'test.com',
  image_url: 'test.com',
  description: 'Some Description',
  externalLink: 'test.com',
  external_link: 'test2.com',
  externalUrl: 'test3.com',
  external_url: 'test4.com',
  media: [],
  type: 'test'
};

const metadata: Metadata = {
  name: 'test',
  description: 'Some Description',
  image: 'test.png',
  imagePreview: 'test2.jpg',
  imageThumbnail: 'test3.png',
  backgroundColor: 'black',
  background_color: 'white',
  externalUrl: 'test.com',
  external_url: 'test.com',
  animationUrls: [],
  attributes: [],
  contract,
  asset_contract: contract,
  fungible: true
};

export const mockedVenlyNftCreated: VenlyNftCreatedResponse = {
  transactionHash: 'testhash',
  metadata: metadata,
  destinations: ['address1', 'address2', 'address3', 'address4'],
  tokenIds: [1, 2, 3, 4]
};
