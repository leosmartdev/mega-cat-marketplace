import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Product } from './product';
import { environment } from 'environments/environment';
import { WalletService } from '../wallet/wallet.service';
import { AuthService } from '../auth/auth.service';
const baseUrl = environment.apiUrl;

export interface WalletAddressPayload {
  walletAddress: any;
}

@Injectable()
export class ProductService {
  constructor(private httpClient: HttpClient, private walletService: WalletService, private authService: AuthService) {}

  createProduct(formData: FormData): Observable<any> {
    if (!formData.has('name')) {
      throw new Error('Product name is not present');
    }

    if (!formData.has('description')) {
      throw new Error('Product description is not present');
    }

    if (!formData.has('walletAddress')) {
      throw new Error('Wallet Address is not present');
    }

    if (!formData.has('properties')) {
      throw new Error('Product properties are not present');
    }

    try {
      JSON.parse(formData.get('properties').toString());
    } catch (err) {
      throw new Error('Properties are not a valid JSON string');
    }

    return this.httpClient.post(`${baseUrl}/product/create/`, formData, {
      headers: this.authService.getAuthHeader()
    });
  }

  createCollection(formData: FormData): Observable<any> {
    if (!formData.has('name')) {
      throw new Error('Collection name is not present');
    }

    if (!formData.has('description')) {
      throw new Error('Collection description is not present');
    }

    if (!formData.has('walletAddress')) {
      throw new Error('Wallet Address is not present');
    }

    if (!formData.has('symbol')) {
      throw new Error('Collection symbol is not present');
    }

    return this.httpClient.post(`${baseUrl}/product/createCollection/`, formData, { headers: this.authService.getAuthHeader() });
  }

  getCollections(data: WalletAddressPayload): Observable<any> {
    if (!data.walletAddress) {
      throw new Error('Wallet Address is not present');
    }

    return this.httpClient.post(`${baseUrl}/product/getCollections/`, data, { headers: this.authService.getAuthHeader() });
  }
  getHistory(tokenId: string, collectionId: string): Observable<any> {
    if (!tokenId || !collectionId) {
      throw new Error('Data is not present');
    }
    return this.httpClient.get(`${baseUrl}/order/getHistory/${tokenId}/${collectionId}`);
  }
  getUserOfCollection(id: string): Observable<any> {
    if (!id) {
      throw new Error('Invalid Id');
    }
    const data = {
      collectionId: id
    };
    return this.httpClient.post(`${baseUrl}/product/getOneCollection/`, data);
  }

  getProduct(id: string): Observable<Product> {
    if (!id) {
      throw new Error('Invalid Id');
    }

    return this.httpClient.get<Product>(`${baseUrl}/product/token/${id}`, { headers: this.authService.getAuthHeader() });
  }

  updateMetadata(formData: FormData): Observable<any> {
    if (!formData.has('name')) {
      throw new Error('Name is not present');
    }

    if (!formData.has('description')) {
      throw new Error('Description is not present');
    }

    if (!formData.has('id')) {
      throw new Error('Id is not present');
    }

    if (!formData.has('properties')) {
      throw new Error('Properties are not present');
    }

    return this.httpClient.post(`${baseUrl}/product/updateMeta`, formData, { headers: this.authService.getAuthHeader() });
  }

  getNFTMetadata(id: string): Observable<any> {
    return this.httpClient.get(`${baseUrl}/product/getNFtMedata/${id}`, { headers: this.authService.getAuthHeader() });
  }

  listingNFT(): Observable<any> {
    const walletAddress = this.walletService.currentAccount;

    return this.httpClient.get(`${baseUrl}/product/getNFTsBasedOnWalletAddress/${walletAddress}`, { headers: this.authService.getAuthHeader() });
  }

  listingNFTByWallet(walletAddress): Observable<any> {
    return this.httpClient.get(`${baseUrl}/product/getNFTsBasedOnWalletAddress/${walletAddress}`, { headers: this.authService.getAuthHeader() });
  }

  listingNFTByLinkedWallets(): Observable<any> {
    const user = this.authService.user;
    return this.httpClient.get(`${baseUrl}/product/getNFTsBasedOnUserWalletAddressesByUser/${user.id}`, { headers: this.authService.getAuthHeader() });
  }
  /**
   * Creates an Offer (Listing) from an NFT.
   *
   * Returns the result of Get prepared Approve tx. If result is [], then no approval is required.
   * If the result is not, then approval is required.
   *
   * @param data
   */
  createForSale(formData: FormData): Observable<any> {
    if (!formData.has('tokenId')) {
      throw new Error('Token id is not present');
    }

    if (!formData.has('address')) {
      throw new Error('Address is not present');
    }

    if (!formData.has('sellerAddress')) {
      throw new Error('Seller Address is not present');
    }

    if (!formData.has('price')) {
      throw new Error('Price is not present');
    }

    if (!formData.has('chain')) {
      throw new Error('Chain is not present');
    }

    return this.httpClient.post(`${baseUrl}/product/createSaleOffer/`, formData, { headers: this.authService.getAuthHeader() });
  }

  /**
   * Fetches all listings (offers) owned by Mega Cat Labs marketplace. Filtering must be implemented in UI.
   *
   * @returns An array of listings.
   */
  getAllListings(filter?: string, auctionOffers: boolean = false): Observable<any> {
    const filterQuery = filter ? `?filter=${filter}` : '';
    const auctionOfferQuery = filter ? `&auctionOffers=${auctionOffers}` : `?auctionOffers=${auctionOffers}`;

    return this.httpClient.get(`${baseUrl}/product/listSaleOffers${filterQuery}${auctionOfferQuery}`, { headers: this.authService.getAuthHeader() });
  }

  getAllReadyListings = () => this.getAllListings('READY');

  editListing(data): Observable<any> {
    return this.httpClient.post(`${baseUrl}/product/editOffer`, data, { headers: this.authService.getAuthHeader() });
  }

  cancelListing(data): Observable<any> {
    return this.httpClient.post(`${baseUrl}/product/cancelOffer`, data, { headers: this.authService.getAuthHeader() });
  }

  specificOffer(id: string): Observable<any> {
    return this.httpClient.get(`${baseUrl}/product/offer/${id}`, { headers: this.authService.getAuthHeader() });
  }

  getStats(): Observable<any> {
    return this.httpClient.get(`${baseUrl}/product/getStats`, { headers: this.authService.getAuthHeader() });
  }

  getOrderHistory(): Observable<any> {
    return this.httpClient.get(`${baseUrl}/order/index`, { headers: this.authService.getAuthHeader() });
  }
  getNFTMetadataByContract(contractAddress: string, tokenId: string): Observable<any> {
    return this.httpClient.get(`${baseUrl}/product/getNftMetadataByContract/${contractAddress}/${tokenId}`, { headers: this.authService.getAuthHeader() });
  }
}
