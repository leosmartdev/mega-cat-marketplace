import { Nft } from 'app/core/models/nft.model';
import { OfferResponseModel } from 'app/core/models/offer-response.model';
import { Offer } from 'app/core/models/offer.model';

const nft: Nft = {
  id: '1234',
  tokenId: '123',
  address: 'Test address',
  chain: 'Test nft chain',
  name: 'Test nft',
  description: 'Test desc',
  imageUrl: 'test.png',
  url: '',
  imagePreviewUrl: '',
  imageThumbnailUrl: '',
  attributes: [],
  contract: {
    name: 'abc',
    chain: '',
    description: '',
    address: '',
    symbol: '',
    media: [],
    type: '',
    verified: true,
    premium: true,
    categories: [],
    url: '',
    imageUrl: ''
  }
};
const offer: Offer = {
  id: '123',
  nft,
  sellerId: '',
  sellerAddress: '',
  sellerNickname: '',
  startDate: new Date(),
  type: '',
  status: '',
  dataToSign: '',
  createdOn: new Date(),
  createdBy: '',
  price: 100,
  currency: 'USD',
  signed: true,
  modifiedBy: '',
  modifiedOn: new Date(),
  buyerWalletAddress: '',
  externalBuyerId: ''
};

export const orderItemStatusMocked: OfferResponseModel = {
  success: true,
  result: offer
};
