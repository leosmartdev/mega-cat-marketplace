import { Nft } from './nft.model';

export class UpdateOfferSignatureResponseModel {
  data: {
    success: boolean;
    result: {
      id: string;
      nft: Nft;
    };
    sellerId: string;
    sellerAddress: string;
    startDate: Date;
    endDate: Date;
    type: string;
    status: string;
    createdOn: Date;
    createdBy: string;
    price: number;
    dataToSign: string;

    // Extra properties not in documentation
    sellerNickname?: string;
    txApprove?: string;
    txInCustody?: string;
    signed?: boolean;
    currency?: string;
  };
}
