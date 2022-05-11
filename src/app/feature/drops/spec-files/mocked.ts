import { mockUser } from 'app/core/auction/spec-files/mocked';
import { NftDrop } from 'app/core/models/nft-drop.model';

export const mockedNftDrop: NftDrop = {
  _id: '1234',
  name: 'test nft',
  description: 'Some description',
  image: 'test.png',
  user: mockUser,
  smartContractAddress: 'test address',
  contractName: 'test contract',
  chain: 'mumbai',
  standardTokens: 10,
  premiumTokens: 5,
  premiumTokenIds: [],
  reservationNumber: 50,
  currentMint: 5,
  price: 100,
  currency: 'USD',
  sections: [],
  mints: [],
  paymentOwner: 'someone',
  whitelist: '',
  whitelistUrl: '',
  launchDateTime: null,
  publicDateTime: null
};

const price = '100';
const confirmations = 1;
const quantity = 1;
export const stages = [
  {
    name: 'Payment',
    status: 'dormant',
    description: `Sending payment of ${price} ETH (cost and gas fees) and waiting for ${confirmations} confirmations.`
  },
  {
    name: 'Preparing',
    status: 'dormant',
    description: `Preparing to mint ${quantity} Book(s).`
  },
  {
    name: 'Minting',
    status: 'dormant',
    description: 'Executing mint on the blockchain.'
  }
];

export const mockedMintItem = {
  tokenId: '1234',
  mintedOn: 123456,
  recipient: 'testWallet',
  txHash: 'dvsdjbnloa',
  confirmed: false,
  quantity: '10'
};
