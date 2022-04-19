import { Nft } from 'app/core/models/nft.model';
import { Offer } from 'app/core/models/offer.model';
import { Role } from 'app/core/models/role';
import { VenlyWalletNft } from 'app/core/models/venly/venly-wallet-nft.model';
import { User } from 'app/core/user/user.types';
import { AuctionBid, AuctionExpireResponse, AuctionOfferResponse, AuctionResponse, AuctionStates, NftAuctionResponse } from '../auction';

export const mockedNft: Nft = {
  id: 'abcd',
  tokenId: 'xshdgs',
  address: 'uiwkejydt',
  chain: 'oiuwdcwvgehd',
  name: 'testNft',
  description: 'Some Description',
  imageUrl: 'test.png',
  url: 'test.xyz',
  imagePreviewUrl: 'test.png',
  imageThumbnailUrl: 'test.png',
  attributes: [],
  contract: {
    name: 'test Contract',
    chain: 'test',
    description: 'Some Description',
    address: 'Test',
    symbol: 'Test Symbol',
    media: [
      {
        type: 'collectionId',
        value: '123'
      },
      {
        type: 'about',
        value: '456'
      },
      {
        type: 'subheading',
        value: '789'
      },
      {
        type: 'story',
        value: '012'
      },
      {
        type: 'perks',
        value: '345'
      }
    ],
    type: 'test',
    verified: true,
    premium: true,
    categories: [],
    url: 'test.xyz',
    imageUrl: 'test.png'
  },
  collectionIdentifier: 'abcd'
};

export const mockedOfferResponse: Offer = {
  id: '123',
  nft: mockedNft,
  sellerId: 'abdc',
  sellerAddress: 'xyz',
  sellerNickname: 'xyz',
  startDate: new Date(),
  type: 'test',
  status: 'READY',
  dataToSign: 'abcdefg',
  createdOn: new Date(),
  createdBy: 'xyz',
  price: 123,
  currency: 'USD',
  signed: true,
  modifiedBy: 'xyz',
  modifiedOn: new Date(),
  buyerWalletAddress: 'abcdgfejhre',
  externalBuyerId: '4567',
  auction: {
    id: 123,
    expirationTime: 60,
    startingBid: 100,
    status: AuctionStates.ON_GOING,
    bids: [],
    ownerId: {
      name: "Owner's Name",
      username: 'owner_username'
    }
  }
};

export const mockedNftUtilsOffer = {
  id: '123',
  nft: {
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
    },
    collectionIdentifier: ''
  },
  sellerId: '',
  sellerAddress: '',
  sellerNickname: '',
  startDate: new Date(),
  type: '',
  status: '',
  dataToSign: '',
  createdOn: new Date(),
  createdBy: '',
  price: 10,
  currency: 'USD',
  signed: true,
  modifiedBy: '',
  modifiedOn: new Date(),
  buyerWalletAddress: '',
  externalBuyerId: ''
};

export const mockedNftCard = {
  tokenId: '1234',
  name: 'Test nft',
  description: 'Test desc',
  image: 'test.png',
  metadata: [],
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
  },
  marketplace: {
    type: 'listing-buynow'
  },
  auction: undefined,
  listing: Object.assign({}, mockedNftUtilsOffer)
};

export const mockedvenlyWalletNft: VenlyWalletNft = {
  id: '123',
  name: 'Test wallet',
  description: 'Test Desc',
  url: null,
  backgroundColor: null,
  imageUrl: 'test.png',
  chain: 'rinkeby',
  imagePreviewUrl: 'Test image preview url',
  imageThumbnailUrl: 'Test image Thumbnail url',
  animationUrl: null,
  animationUrls: [],
  fungible: true,
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
  },
  attributes: [],
  balance: 1000,
  finalBalance: 1000
};

export const mockedvenlyWalletNftResponse = {
  tokenId: '123',
  name: 'Test wallet',
  description: 'Test Desc',
  image: 'test.png',
  metadata: [],
  chain: 'rinkeby',
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
  },
  marketplace: {
    type: 'owned'
  }
};

const mockedAuctionOffer: AuctionOfferResponse = {
  id: 'test',
  price: 10,
  sellerAddress: 'test Address'
};

export const mockedNftAuctionResponse: NftAuctionResponse = {
  auction: {
    id: 123,
    expirationTime: 60,
    startingBid: 100,
    status: AuctionStates.ON_GOING,
    bids: [
      {
        userId: {
          name: 'test user 2',
          username: 'test-2@xyz'
        },
        bidAmount: 10
      }
    ],
    ownerId: {
      name: "Owner's Name",
      username: 'owner_username'
    },
    winnerId: {
      username: '',
      name: ''
    }
  },
  offer: mockedAuctionOffer
};
export const mockUser: User = {
  id: '_093824',
  _id: '_093824',
  name: '_093824',
  bio: 'Some info',
  email: '_093824',
  avatar: '_093824',
  status: '_093824',
  accessToken: '_093824',
  role: Role.User,
  isFirebaseUser: false,
  firebaseUser: null,
  banner: '093824',
  username: 'JohnDoe123',
  walletAddresses: ['TestAddress1', 'TestAddress2'],
  linkedWalletAddresses: ['TestAddress1', 'TestAddress2', 'TestAddress3']
};

export const mockedBid: AuctionBid = {
  userId: {
    name: 'test',
    username: 'test@xyz'
  },
  bidAmount: 20
};

export const mockedExpiredAuction: AuctionExpireResponse = {
  status: AuctionStates.EXPIRED,
  winnerId: {
    username: 'testWinner@xyz',
    name: 'Test Winner'
  }
};
