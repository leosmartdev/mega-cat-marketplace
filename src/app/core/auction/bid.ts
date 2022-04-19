export interface Bid {
  _id;
  bidAmount: number;
  username: string;
  userId: {
    name: string;
    username: string;
  };
  createdAt: Date;
  updatedAt: Date;
}
