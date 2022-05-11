import { PaymentService } from 'app/core/payment/payment.service';
import { NftDrop } from './../../core/models/nft-drop.model';
import { Injectable } from '@angular/core';
import { List } from 'lodash';
import { HttpClient } from '@angular/common/http';
import { switchMap } from 'rxjs/operators';
import { environment } from 'environments/environment';
import { Observable, Observer } from 'rxjs';
import { AuthService } from 'app/core/auth/auth.service';
import { WizardStage } from 'app/shared/wizard-dialog-service/wizard-stage.model';

const baseUrl = environment.apiUrl;
const DROP_POLL_INTERVAL = 3000;
const ETHERSCAN_POLL_INTERVAL = 3000;

@Injectable({
  providedIn: 'root'
})
export class DropService {
  public GWEI_TO_WEI = 1_000_000_000;
  dropsPoller: Observable<any>;
  gasOraclePoller: Observable<any>;
  kill: boolean = false;

  constructor(private httpClient: HttpClient, private authService: AuthService, private paymentService: PaymentService) {}

  createDrop(drop: FormData):
    | Observable<{
        message: string;
        data: NftDrop;
      }>
    | Observable<any> {
    const headerOptions = {
      headers: this.authService.getAuthHeader()
    };
    return this.httpClient.post(`${baseUrl}/drops/create`, drop, headerOptions);
  }

  mintDrop(paymentTxHash: string, quantity: number, to: string, dropId: string, contractAddress: string, network: string): Observable<any> | any {
    const body = {
      quantity,
      paymentTxHash,
      to,
      contractName: 'BookCoinNFT',
      smartContractAddress: contractAddress,
      network,
      dropId
    };
    const headerOptions = {
      headers: this.authService.getAuthHeader()
    };
    return this.httpClient.post(`${baseUrl}/drops/mint`, body, headerOptions);
  }

  fetchWhitelist(googleSheetId: string): Observable<any> | any {
    const headerOptions = {
      headers: this.authService.getAuthHeader()
    };
    return this.httpClient.get(`${baseUrl}/sheets/whitelist/${googleSheetId}`, headerOptions);
  }

  fetchWhitelistByDrop(dropId: string): Observable<any> | any {
    const headerOptions = {
      headers: this.authService.getAuthHeader()
    };
    return this.httpClient.get(`${baseUrl}/sheets/whitelist/drop/${dropId}`, headerOptions);
  }

  calculateGasPricePerUnit(): Observable<any> {
    const headerOptions = {
      headers: this.authService.getAuthHeader()
    };
    return this.httpClient.get(`${baseUrl}/drops/etherscan/oracle`, headerOptions);
  }

  getGasCostForMintTransaction() {
    return 52_000; // highest was 51869;
  }

  pollDrops():
    | Observable<{
        message: string;
        data: List<NftDrop>;
      }>
    | Observable<any> {
    if (!Boolean(this.dropsPoller)) {
      this.dropsPoller = new Observable((observer: Observer<any>) => {
        this.helper(observer, DROP_POLL_INTERVAL);
      });
    }

    return this.dropsPoller;
  }

  pollGasOracle():
    | Observable<{
        message: string;
        data: List<NftDrop>;
      }>
    | Observable<any> {
    if (!Boolean(this.gasOraclePoller)) {
      this.gasOraclePoller = new Observable((observer: Observer<any>) => {
        this.gasOraclePollerHelper(observer, ETHERSCAN_POLL_INTERVAL);
      });
    }

    return this.gasOraclePoller;
  }

  requestEtherPayment(ether: number, destination: string): Promise<any> {
    return this.paymentService.requestEtherPayment(ether, destination);
  }

  killPoll() {
    this.kill = true;
  }

  gasOraclePollerHelper(observer: Observer<any>, timeout: number) {
    if (this.kill) {
      console.log('Killing Gas Oracle poll');
      return;
    }
    setTimeout(() => {
      this.calculateGasPricePerUnit()
        .toPromise()
        .then((result) => {
          observer.next(result);
          this.gasOraclePollerHelper(observer, timeout);
        });
    }, timeout);
  }

  helper(observer: Observer<any>, timeout: number) {
    if (this.kill) {
      console.log('Killing Drop poll');
      return;
    }
    setTimeout(() => {
      this.fetchDrops()
        .toPromise()
        .then((result) => {
          observer.next(result);
          this.helper(observer, timeout);
        });
    }, timeout);
  }

  fetchDrops():
    | Observable<{
        message: string;
        data: List<NftDrop>;
      }>
    | Observable<any> {
    return this.httpClient.get(`${baseUrl}/drops`);
  }

  fetchDrop(dropId: number):
    | Observable<{
        message: string;
        data: NftDrop;
      }>
    | Observable<any> {
    return this.httpClient.get(`${baseUrl}/drops/${dropId}`);
  }
}
