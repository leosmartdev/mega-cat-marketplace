export interface CartItem {
  _id: string;
  name: string;
  tokenId: string;
  collection?: string; // TODO: Make this required and fix tests.
  image: string;
  price: number;
  count: number;
  subTotal: number;
  sellerAddress: string;
}
