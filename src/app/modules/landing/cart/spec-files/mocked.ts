import { CartItem } from 'app/core/cart/cartItem';

export const mockedCartItem: CartItem = {
  _id: '123',
  tokenId: '1234',
  name: 'Test nft',
  image: 'test.png',
  collection: 'test', // TODO: Make this required and fix tests.
  price: 100,
  count: 5,
  subTotal: 100,
  sellerAddress: 'test address'
};

export const mockedSaleNFt = {
  id: mockedCartItem._id,
  nft: {
    id: mockedCartItem.tokenId,
    name: mockedCartItem.name,
    tokenId: mockedCartItem.tokenId,
    imageUrl: mockedCartItem.image,
    collectionIdentifier: {
      value: 'testIdetifier'
    }
  },
  price: mockedCartItem.price,
  subTotal: mockedCartItem.subTotal,
  collection: mockedCartItem.collection,
  sellerAddress: mockedCartItem.sellerAddress
};
