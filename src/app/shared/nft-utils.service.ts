import { WalletService } from 'app/core/wallet/wallet.service';
import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { FormGroup } from '@angular/forms';
import { NftCardModel } from 'app/core/models/nft-card.model';
import { Offer } from 'app/core/models/offer.model';
import { VenlyWalletNft } from 'app/core/models/venly/venly-wallet-nft.model';
import { Observable, of } from 'rxjs';
import { environment } from 'environments/environment';
import { catchError, map } from 'rxjs/operators';
import { SmartContractVerification } from 'app/core/models/smart-contract-verification.model';
import { CountdownConfig } from 'ngx-countdown';

const CACHE_PREFIX = 'smartContractStatus';
const CountdownTimeUnits: Array<[string, number]> = [
  ['Y', 1000 * 60 * 60 * 24 * 365], // years
  ['M', 1000 * 60 * 60 * 24 * 30], // months
  ['D', 1000 * 60 * 60 * 24], // days
  ['H', 1000 * 60 * 60], // hours
  ['m', 1000 * 60], // minutes
  ['s', 1000], // seconds
  ['S', 1] // million seconds
];

export interface EtherscanAbiResponse {
  status: string;
  message: string;
  result: string;
}

interface GetOwnerResponse {
  owner: string;
  contractName: string;
  contractAddress: string;
  network: string;
  elapsed: string;
}

interface venlyOfferParams {
  offer: Offer;
  marketplaceType?: 'listing-buynow' | 'listing-auction' | 'owned-pending' | 'listing-pending';
}

@Injectable({
  providedIn: 'root'
})
export class NftUtilsService {
  constructor(private httpClient: HttpClient, private walletService: WalletService) {}

  buildNftCardFromVenlyOffer({ offer, marketplaceType = 'listing-buynow' }: venlyOfferParams): NftCardModel {
    const nftCard: NftCardModel = {
      tokenId: offer?.nft?.id,
      name: offer?.nft?.name,
      description: offer?.nft?.description,
      image: Boolean(offer?.nft?.imageUrl) ? offer?.nft?.imageUrl : this.getDefaultImage(),
      metadata: offer?.nft?.attributes,
      contract: Object.assign({}, offer?.nft?.contract),
      marketplace: {
        type: marketplaceType
      },
      auction: offer.auction,
      listing: Object.assign({}, offer)
    };

    return nftCard;
  }

  buildNftCardFromVenlyWalletNft(nft: VenlyWalletNft): NftCardModel {
    const nftCard: NftCardModel = {
      tokenId: nft.id,
      name: nft.name,
      description: nft.description,
      image: nft.imageUrl,
      metadata: nft.attributes,
      contract: nft.contract,
      chain: nft.chain,
      marketplace: {
        type: 'owned'
      }
    };

    return nftCard;
  }

  setContractStatus(contractAddress: string, status: SmartContractVerification): void {
    const chainId = this.walletService.getChainId();
    console.log(`setting contract status for ${contractAddress}@${chainId}`, status);
    const contractKey = `${CACHE_PREFIX}_${chainId}_${contractAddress}`;
    localStorage.setItem(contractKey, JSON.stringify(status));
  }

  getContractStatus(contractAddress): SmartContractVerification {
    const chainId = this.walletService.getChainId();
    const contractKey = `${CACHE_PREFIX}_${chainId}_${contractAddress}`;

    const json = localStorage.getItem(contractKey);
    const status = json ? JSON.parse(json) : null;
    return status;
  }

  updateContractStatus(contractAddress: string, key: string, value: string): void {
    const status = this.getContractStatus(contractAddress);

    if (status[key]) {
      status[key] = value;
      this.setContractStatus(contractAddress, status);
    }
  }

  getVerifiedContractAbi(contractAddress: string, chain: string): Observable<any[]> | any {
    const polyscanApiKey = 'IZY9WP94S3XIWY21ZJFZXCETII7NQWAV5G';
    const baseUrl = this.getBaseUrlFromChain(chain); // TODO: Move to config and make dynamic.
    const url = `${baseUrl}/api?module=contract&action=getabi&address=${contractAddress}&apikey=${polyscanApiKey}`;
    console.log('Checking smart contract');

    return this.httpClient.get(url).pipe(
      map((response: EtherscanAbiResponse) => {
        try {
          return JSON.parse(response.result);
        } catch (error) {
          throw Error(response.result);
        }
      }),
      catchError((err, caught) => {
        console.error('Failed to fetch Contract ABI', err);
        return [];
      })
    );
  }

  getOwner(contractAddress: string, chain: any, contractName: string = 'ChildMegaTokens'): Observable<any[]> | any {
    const network = chain ?? 'mumbai';
    const getOwnerUrl = `${environment.bloxApiUrl}/blockchain/contract/owner?network=${network}&contractAddress=${contractAddress}&contractName=${contractName}`;
    return this.httpClient.get(getOwnerUrl);
  }

  hasRole(contractAddress, chain, target, role, contractName: string = 'ChildMegaTokens'): Observable<any[]> | any {
    const network = chain ?? 'mumbai';
    // eslint-disable-next-line max-len
    const hasRoleUrl = `${environment.bloxApiUrl}/blockchain/contract/hasRole?network=${network}&contractAddress=${contractAddress}&contractName=${contractName}&role=${role}&target=${target}`;
    return this.httpClient.get(hasRoleUrl);
  }

  /** Timezone helper methods */
  getLocalDateTimeNow(offsetMillis = 0): string {
    const tzoffset = new Date().getTimezoneOffset() * 60000; //offset in milliseconds
    const localISOTime = new Date(Date.now() + offsetMillis - tzoffset).toISOString().slice(0, 16);
    return localISOTime;
  }

  // TODO: Fix this so it actually works.
  getCountDownConfiguration(dateTimeAsString): CountdownConfig {
    const leftTime = Math.round((new Date(dateTimeAsString).getTime() - new Date().getTime()) / 1000);
    return {
      leftTime,
      formatDate: ({ date, formatStr }) => {
        let duration = Number(date || 0);

        return CountdownTimeUnits.reduce((current, [name, unit]) => {
          if (current.indexOf(name) !== -1) {
            const v = Math.floor(duration / unit);
            duration -= v * unit;
            return current.replace(new RegExp(`${name}+`, 'g'), (match: string) => v.toString().padStart(match.length, '0'));
          }
          return current;
        }, formatStr);
      }
    };
  }

  getTimeLeftFromDateAsString(dateTime: string) {
    const timeLeft = Math.round((new Date(dateTime).getTime() - new Date().getTime()) / 1000);
    return timeLeft;
  }

  /**
   * This method is useful for reading file uploads as Data URLs for use in frontend.
   * eg: as [src] in an image element
   */
  setupReadAsDataURL(event: any, onLoad: (event: any) => void, onError: (event: any) => void) {
    const reader = new FileReader();
    reader.onload = (onloadEvent: any) => {
      onLoad(onloadEvent);
    };
    reader.onerror = (errorEvent: any) => {
      onError(errorEvent);
    };

    reader.readAsDataURL(event.target.files[0]);
  }

  /**
   * This method is useful for reading file uploads to pass to the backend.
   * */
  setupReadAsBinaryString(event: any, onLoad: (event: any) => void, onError: (event: any) => void) {
    const reader = new FileReader();
    reader.onload = (onloadEvent: any) => {
      onLoad(onloadEvent);
    };
    reader.onerror = (errorEvent: any) => {
      onError(errorEvent);
    };

    reader.readAsBinaryString(event.target.files[0]);
  }

  getFallbackImage(): string {
    return 'assets/images/mcl/no-cat.png';
  }

  delay(timeInMilliseconds) {
    return new Promise((resolve) => setTimeout(resolve, timeInMilliseconds));
  }

  getBaseUrlFromChain(chain: any) {
    let baseUrl = 'https://api-testnet.polygonscan.com';
    if (chain === 'mumbai') {
      baseUrl = 'https://api-testnet.polygonscan.com';
    } else if (chain === 'rinkeby') {
      baseUrl = 'https://api-rinkeby.etherscan.io';
    } else if (chain === 'ethereum') {
      baseUrl = 'https://api.etherscan.io';
    } else if (chain === 'matic' || chain === 'polygon') {
      baseUrl = 'https://api.polygonscan.com';
    }

    return baseUrl;
  }

  private getDefaultImage(): string {
    return 'assets/images/mcl/cat.png';
  }
}
