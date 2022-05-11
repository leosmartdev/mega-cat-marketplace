import { CartItem } from 'app/core/cart/cartItem';

export const mockedCartItem: CartItem = {
  _id: '123',
  tokenId: '1234',
  name: 'Test nft',
  image: 'test.png',
  smartContractAddress: 'test',
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
    contract: {
      address: mockedCartItem.smartContractAddress
    }
  },
  price: mockedCartItem.price,
  subTotal: mockedCartItem.subTotal,
  smartContractAddress: mockedCartItem.smartContractAddress,
  sellerAddress: mockedCartItem.sellerAddress
};
