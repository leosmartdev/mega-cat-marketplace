import { PreparedApproveTx } from './../models/prepared-approve-tx.model';
import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';
import { HttpClient } from '@angular/common/http';
import { switchMap } from 'rxjs/operators';
import { PaymentService } from '../payment/payment.service';
import { WalletService } from '../wallet/wallet.service';
import { environment } from 'environments/environment';
import { ErrorsService } from '../errors/errors.service';
import { UpdateOfferSignatureResponseModel } from '../models/update-offer-signature-response.model';
import { FulfillmentOfferCreatedResponseModel, OfferCreatedResponseModel, Transaction } from '../models/offer-created-response.model';
import { VenlyNftMetadataByContractAndTokenId } from '../models/venly/venly-nft-by-contract-and-token.model';

// This interface and declaration  is necessary for typescript + web3 window behavior.
interface Web3Window extends Window {
  ethereum: any;
  web3: any;
}

declare let window: Web3Window;
const baseUrl = environment.apiUrl;
@Injectable()
export class VenlyService {
  window: any;
  activeAccount: string;
  hash: string;
  walletAddress: any;

  constructor(private httpClient: HttpClient, private paymentService: PaymentService, private walletService: WalletService, private errorService: ErrorsService) {}

  async updateOfferWithApproval(nftContractAddress: string, offerCreatedResponse: FulfillmentOfferCreatedResponseModel | any): Promise<any> {
    let result;

    if (offerCreatedResponse.transaction && offerCreatedResponse.transaction.signableMessages) {
      // Meta Transactions
      console.log('Approval is necessary for collection and wallet');
      result = await this.approve(offerCreatedResponse);
    } else if (offerCreatedResponse.transaction && offerCreatedResponse.transaction.approvalPreparationTransactions) {
      result = await this.approveUsingSetApprovalForAll(nftContractAddress, offerCreatedResponse, this.approveTransaction, this.httpClient, this.addSignature, this.signData);
    } else {
      console.log('Approval is NOT needed for collection and wallet');
    }

    return result;
  }

  async updateOfferWithSignature(offerId: string): Promise<any> {
    const response: any = await this.getOfferDetails(offerId).toPromise();
    const result = await this.signData(response.data.dataToSign, this.addSignature, response.data.id);
    return result;
  }

  /**
   * New approval workflow using MetaTransactions
   * */
  public async approve(data: FulfillmentOfferCreatedResponseModel): Promise<any> {
    const that = this;
    const metaTransaction: Transaction = data.transaction;

    const dataToSign = metaTransaction.signableMessages[0].data;
    const secretType = metaTransaction.signableMessages[0].secretType;
    const payload = await this.walletService.signTypedDataV4(secretType, dataToSign);
    payload.offerId = data.offerId;
    payload.signature = dataToSign.message.functionSignature;
    payload.functionSignature = dataToSign.message.functionSignature; // Future Venly breaking change is moving to this property name.

    return await this.updateOfferMetaTransaction(payload).toPromise();
  }

  /**
   * Legacy approval workflow using SetApprovalForAll; requires user to pay gas and invoke setApprovalForAll directly
   */
  public async approveUsingSetApprovalForAll(
    nftContractAddress: string,
    data: FulfillmentOfferCreatedResponseModel,
    approveTransaction: (data, client, signature, signData) => Observable<any>,
    client,
    addSignature,
    signData
  ): Promise<any> {
    const that = this;
    const address = await that.walletService.currentAccount;
    const prepareApproveTx: PreparedApproveTx = data.transaction.approvalPreparationTransactions[0];

    const smartContractAddress = prepareApproveTx.to;
    const approvalAddress = prepareApproveTx.inputs.filter((param) => param.type === 'address')[0].value;

    const contract = new window.web3.eth.Contract(require('./ABI.json'), smartContractAddress);
    const method = contract.methods.setApprovalForAll(approvalAddress, true).send({
      from: address,
      gas: 210000
    });

    const formData = new FormData();

    await method.on('transactionHash', function (hash) {
      this.hash = hash;
      formData.append('offerId', data.offerId);
      formData.append('hash', this.hash);
    });

    return approveTransaction.call(this, formData, client, addSignature, signData).toPromise();
  }

  public updateOfferMetaTransaction(data): Observable<any> {
    const client = this.httpClient;
    return client.put(`${baseUrl}/product/update-offer-metaTxApprove/`, data).pipe(switchMap((response: any) => of(response)));
  }

  /**
   * Approve Transaction (Legacy) - Updates the Offer with the transaction hash where approval was made for setApprovalForAll
   */
  public approveTransaction(data): Observable<any> {
    const client = this.httpClient;
    return client.post(`${baseUrl}/product/offerTxApprove/`, data).pipe(switchMap((response: any) => of(response)));
  }

  /**
   * Sign Data
   */
  public async signData(data, addSignature: (data) => Observable<any>, offerId): Promise<UpdateOfferSignatureResponseModel> {
    const signature = await window.web3.eth.personal.sign(data, this.walletService.currentAccount);
    const formData = new FormData();
    formData.append('offerId', offerId);
    formData.append('dataToSign', signature);

    return addSignature.call(this, formData).toPromise();
  }

  /**
   * Add Signature
   */
  public addSignature(data): Observable<any> {
    return this.httpClient.post(`${baseUrl}/product/offerSignature/`, data).pipe(
      switchMap((response: any) => {
        console.log(`Successfully listed for sale! ${response}`);
        return of(response);
      })
    );
  }

  public fetchNftMetadata(contractAddress: string, tokenId: string): Observable<VenlyNftMetadataByContractAndTokenId | any> {
    const uri = `${baseUrl}/product/nft/${contractAddress}/${tokenId}`;
    return this.httpClient.get(uri);
  }

  private getOfferDetails(offerId): Observable<any> {
    const uri = `${baseUrl}/product/offer/${offerId}`;
    return this.httpClient.get(uri);
  }
}
