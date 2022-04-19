import { TypedMessage, MessageTypes } from '@metamask/eth-sig-util';

export interface VenlyEIP712MetaTransaction {
  types: MessageTypes;
  domain: EIP712Domain;
  primaryType: string;
  message: Message;
}

export interface EIP712Domain {
  name: string;
  version: string;
  verifyingContract: string;
  salt: ArrayBuffer | string;
  chainId?: number;
}

export interface Message {
  nonce: number;
  from: string;
  functionSignature: string;
}

export interface Types {
  MetaTransaction: Type[];
  EIP712Domain: Type[];
}

export interface Type {
  type: string;
  name: string;
}
