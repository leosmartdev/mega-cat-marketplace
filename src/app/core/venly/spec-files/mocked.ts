import { SignableMessage, Transaction } from './../../models/offer-created-response.model';
import { mockedNft } from 'app/core/auction/spec-files/mocked';
import { FulfillmentOfferCreatedResponseModel, OfferCreatedResponseModel } from 'app/core/models/offer-created-response.model';
import { PreparedApproveTx } from 'app/core/models/prepared-approve-tx.model';
import { UpdateOfferSignatureResponseModel } from 'app/core/models/update-offer-signature-response.model';

export const transactionMocked: PreparedApproveTx = {
  type: 'pending',
  to: 'xyz',
  secretType: 'test',
  value: 123,
  functionName: 'test function',
  inputs: [],
  data: 'test data'
};

export const offercreatedModelMocked: OfferCreatedResponseModel = {
  offerId: 'Test',
  transaction: [transactionMocked]
};

export const fulfillmentOfferTransactionMocked: Transaction = {
  signableMessages: [
    {
      secretType: 'MATIC',
      data: {
        types: null,
        domain: {
          name: 'some contract',
          version: 'version1',
          verifyingContract: '0x029840928340983',
          salt: '000000000000000001'
        },
        primaryType: 'primary',
        message: null
      }
    }
  ]
};

export const fulfillmentOfferCreatedResponseModelMocked: FulfillmentOfferCreatedResponseModel = {
  offerId: 'Test',
  transaction: fulfillmentOfferTransactionMocked
};

export const updateOfferSignatureMocked: UpdateOfferSignatureResponseModel = {
  data: {
    success: true,
    result: {
      id: '123',
      nft: mockedNft
    },
    sellerId: '123',
    sellerAddress: 'test address',
    startDate: new Date(),
    endDate: new Date(),
    type: 'approved',
    status: 'pending',
    createdOn: new Date(),
    createdBy: 'test user',
    price: 100,
    dataToSign: 'test data'
  }
};
