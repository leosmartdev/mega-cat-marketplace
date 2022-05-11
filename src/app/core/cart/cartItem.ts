export interface CartItem {
  _id: string;
  count: number;
  image: string;
  name: string;
  price: number;
  sellerAddress: string;
  smartContractAddress: string;
  subTotal: number;
  tokenId: string;
}
