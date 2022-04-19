import { PreparedApproveTx } from './prepared-approve-tx.model';

export interface FulfillmentOfferCreatedResponseModel {
  transaction: Transaction;
  offerId: string;
}

/**
 * Transactions now support two workflows:
 * 1) meta-transactions
 * 2) manual approval (setApprovalForAll)
 * Meta-transactions allow users to sign a message and the meta transaction to be executed & paid for by Venly marketplace
 * Manual approval requires the user to manually invoke setApprovalForAll
 */
export interface Transaction {
  signableMessages?: SignableMessage[];
  approvalPreparationTransactions?: PreparedApproveTx[];
}

export interface SignableMessage {
  secretType: string;
  data: Data;
}

export interface Data {
  types: Types;
  domain: Domain;
  primaryType: string;
  message: Message;
}

export interface Domain {
  name: string;
  version: string;
  verifyingContract: string;
  salt: string;
}

export interface Message {
  nonce: number;
  from: string;
  functionSignature: string;
}

export interface Types {
  MetaTransaction: Eip712Domain[];
  EIP712Domain: Eip712Domain[];
}

export interface Eip712Domain {
  type: string;
  name: string;
}

/* Legacy model */
export class OfferCreatedResponseModel {
  offerId: string;
  transaction: PreparedApproveTx[];
}
