/* eslint-disable prefer-arrow/prefer-arrow-functions */
import { Injectable, NgZone } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import Web3 from 'web3';
import MetaMaskOnboarding from '@metamask/onboarding';
import { environment } from 'environments/environment';
import detectEthereumProvider from '@metamask/detect-provider';
import { Observable, Observer, of } from 'rxjs';
import { Router } from '@angular/router';
import { AuthService } from '../auth/auth.service';
import { VenlyEIP712MetaTransaction } from '../models/venly/eip712.model';
import { recoverTypedSignature, signTypedData, SignTypedDataVersion } from '@metamask/eth-sig-util';
import * as sigUtil from 'eth-sig-util';
import * as ethUtil from 'ethereumjs-util';
// This interface and declaration  is necessary for typescript + web3 window behavior.
interface Web3Window extends Window {
  ethereum: any;
  web3: any;
}

const DEFAULT_INTERVAL = 1000;
const DEFAULT_BLOCKS_TO_WAIT = 2;

interface Options {
  interval: number;
  blocksToWait: number;
}

declare let window: Web3Window;
const GOERLI_CHAIN_ID_HEX = '0x5';
const POLYGON_CHAIN_ID_HEX = '0x13881';
const RINKEBY_CHAIN_ID_HEX = '0x4';

const CHAIN_NAMES = {
  1: 'ethereum',
  3: 'ropsten',
  4: 'rinkeby',
  5: 'goerli',
  42: 'kovan',
  137: 'polygon',
  80001: 'mumbai'
};

@Injectable({
  providedIn: 'root' // This must stay a singleton
})
export class WalletService {
  private static forwarderOrigin = environment.metamaskForwarderOrigin;
  private static maxCachedHours: number = 24;
  metaMaskOnboarder: MetaMaskOnboarding;
  currentAccount: any;
  chainId: string;
  chainIdWatcher: Observable<any>;
  accountWatcher: Observable<any>;
  window: Web3Window;
  private chainIdObserver: Observer<any>;
  private accountObserver: Observer<any>;
  private loggedIn: boolean;

  constructor(private ngZone: NgZone, private httpClient: HttpClient, private router: Router, private authService: AuthService) {
    this.accountWatcher = of([]);
    this.chainIdWatcher = of([]);
    this.restoreState();
    this.initializeWeb3();
  }

  /**
   * Initializes web3 and window.ethereum object using backwards compatibility
   */
  async initializeWeb3() {
    this.window = window;
    if (!this.isMetaMaskInstalled()) {
      console.error('Metamask is not installed.');
      this.metaMaskOnboarder = new MetaMaskOnboarding({
        forwarderOrigin: WalletService.forwarderOrigin,
        forwarderMode: 'INJECT'
      });
    }

    detectEthereumProvider().then(
      (provider) => {
        if (provider) {
          // Use MetaMask's injected global API.
          if (provider !== window.ethereum) {
            console.error('Do you have multiple wallets installed? Provider and window.ethereum do not match!');
          }
          window.web3 = new Web3(window.ethereum);
        } else if (window.web3) {
          // Deprecated backwards compatibility.
          window.web3 = new Web3(window.web3.currentProvider);
        } else {
          return;
        }

        this.setupObservablesForEthereum();
      },
      (error) => {
        console.log(`An error occured trying to detect Ethereum provider ${error}`);
      }
    );
  }

  getWeb3() {
    return window.web3;
  }

  getChainHexByName(name: string): string {
    let chainHex = '0x';
    for (const chainDecimal in CHAIN_NAMES) {
      if (Object.prototype.hasOwnProperty.call(CHAIN_NAMES, chainDecimal)) {
        const chainName = CHAIN_NAMES[chainDecimal];
        if (name.toLowerCase() === chainName.toLowerCase()) {
          chainHex = `0x${parseInt(chainDecimal, 10).toString(16)}`;
          break;
        }
      }
    }

    return chainHex;
  }

  /**
   * Prompts user to connect to MetaMask. Triggers observables for watching accounts.
   */
  connectToMetaMask() {
    window.ethereum
      .request({ method: 'eth_requestAccounts' })
      .then((_accounts) => {
        this.accountObserver.next(_accounts);
        this.updateAccount(_accounts);
        this.authService.check().subscribe((authenticated) => {
          this.loggedIn = authenticated;
        });
        if (this.loggedIn) {
          const formData = new FormData();
          formData.append('walletAddress', _accounts[0]);
          this.authService.updateLinkedWalletAddresses(formData).subscribe();
          this.router.navigateByUrl('/collections');
        } else {
          this.router.navigateByUrl('/sign-in');
        }
      })
      .catch((err) => {
        if (err.code === 4001) {
          // EIP-1193 userRejectedRequest error
          // If this happens, the user rejected the connection request.
          console.log('Please connect to MetaMask.');
        } else {
          console.error(err);
        }
      });
  }

  truncateAddress(address: string) {
    return address.slice(0, 5) + ' ... ' + address.slice(-4);
  }

  sendEthereum(destination, amount): Promise<any> {
    // console.log(window.web3.utils.toWei(amount.toString(), 'ether'));
    return window.ethereum.request({
      method: 'eth_sendTransaction',
      params: [
        {
          from: this.currentAccount,
          to: destination,
          value: window.web3.utils.numberToHex(window.web3.utils.toWei(amount.toString(), 'ether'))
        }
      ]
    });
  }

  async signTypedDataV3(secretType: string, data: VenlyEIP712MetaTransaction | any): Promise<any> {
    if (data == null) {
      data = await this.mockTypedData();
    }
    const msgParams = JSON.stringify(data);

    const from = this.getConnectedWallet(); // window.web3.eth.accounts[0];

    const params = [from, msgParams];
    const method = 'eth_signTypedData_v3';

    return window.web3.currentProvider.sendAsync(
      {
        method: method,
        params: params,
        from: from
      },
      function (err, result) {
        if (err) {
          return console.error(err);
        }
        const signature = result.result.substring(2);
        const r = '0x' + signature.substring(0, 64);
        const s = '0x' + signature.substring(64, 128);
        const v = parseInt(signature.substring(128, 130), 16);
        // The signature is now comprised of r, s, and v.

        console.log('SUCCESSFULLY SIGNED!', signature, r, s, v);
      }
    );
  }

  async signTypedDataV4(secretType: string, data: VenlyEIP712MetaTransaction | any): Promise<any> {
    if (data == null) {
      data = await this.mockTypedData();
    }

    const promise = new Promise((resolve, reject) => {
      this._signTypedDataV4Builder(data, resolve, reject);
    });

    return promise;
  }

  _signTypedDataV4Builder(data: VenlyEIP712MetaTransaction | any, resolve: (value: unknown) => void, reject: (reason?: any) => void): void {
    const parameters = JSON.stringify(data);

    const from = this.getConnectedWallet();
    const params = [from, parameters];
    const method = 'eth_signTypedData_v4';

    window.web3.currentProvider.sendAsync(
      {
        method,
        params,
        from
      },
      (err, result) => {
        if (err) {
          console.error(err);
          reject(err);
        } else if (result.error) {
          console.error(result.error);
          reject(result.error.message);
        }

        console.log('TYPED SIGNED:' + JSON.stringify(result.result));

        const signature = result.result.substring(2);
        const r = '0x' + signature.substring(0, 64);
        const s = '0x' + signature.substring(64, 128);
        const v = parseInt(signature.substring(128, 130), 16);

        console.log('SUCCESSFULLY SIGNED!', signature, r, s, v);

        // const recovered = sigUtil.recoverTypedSignature_v4({
        //    data: JSON.parse(parameters),
        //    sig: result.result,
        // });

        const recovered = recoverTypedSignature({
          data: data,
          signature: result.result,
          version: SignTypedDataVersion.V4
        });

        if (ethUtil.toChecksumAddress(recovered) === ethUtil.toChecksumAddress(from)) {
          const payload = {
            r,
            s,
            v
          };
          console.log('Successfully recovered signer as ' + from);
          resolve(payload);
        } else {
          console.error('Failed to verify signer when comparing ' + result + ' to ' + from);
          reject('Failed to verify signer when comparing ' + result + ' to ' + from);
        }
      }
    );
  }

  /**
   * Wait for one or multiple transactions to confirm.
   *
   * @param txnHash A transaction hash or list of those
   * @param options Wait timers
   * @return Transaction receipt
   */
  waitTransaction(txHash: string | string[], confirmations: number, options: Options = null, onBlockChange: (confirms: number) => void = () => {}): Promise<any> {
    const web3 = this.window.web3;
    const interval = options && options.interval ? options.interval : DEFAULT_INTERVAL;
    const blocksToWait = confirmations ?? (options && options.blocksToWait ? options.blocksToWait : DEFAULT_BLOCKS_TO_WAIT);
    const transactionReceiptAsync = async (txnHash: string, resolve, reject) => {
      try {
        const receipt = web3.eth.getTransactionReceipt(txnHash);
        if (!receipt) {
          setTimeout(() => {
            transactionReceiptAsync(txnHash, resolve, reject);
          }, interval);
        } else {
          if (blocksToWait > 0) {
            const resolvedReceipt = await receipt;
            if (!resolvedReceipt || !resolvedReceipt.blockNumber) {
              setTimeout(() => {
                transactionReceiptAsync(txnHash, resolve, reject);
              }, interval);
            } else {
              try {
                const block = await web3.eth.getBlock(resolvedReceipt.blockNumber);
                const current = await web3.eth.getBlock('latest');
                const confirms = current.number - block.number;
                if (current.number - block.number >= blocksToWait) {
                  onBlockChange(confirms);
                  const txn = await web3.eth.getTransaction(txnHash);
                  if (txn.blockNumber != null) {
                    resolve(resolvedReceipt);
                  } else {
                    reject(new Error('Transaction with hash: ' + txnHash + ' ended up in an uncle block.'));
                  }
                } else {
                  onBlockChange(confirms);
                  setTimeout(() => {
                    transactionReceiptAsync(txnHash, resolve, reject);
                  }, interval);
                }
              } catch (e) {
                setTimeout(() => {
                  transactionReceiptAsync(txnHash, resolve, reject);
                }, interval);
              }
            }
          } else {
            resolve(receipt);
          }
        }
      } catch (e) {
        reject(e);
      }
    };

    // Resolve multiple transactions once
    if (Array.isArray(txHash)) {
      const promises = [];
      txHash.forEach((oneTxHash) => {
        promises.push(this.waitTransaction(oneTxHash, confirmations, options));
      });
      return Promise.all(promises);
    } else {
      return new Promise((resolve, reject) => {
        transactionReceiptAsync(txHash, resolve, reject);
      });
    }
  }

  /**
   * Check if the transaction was success based on the receipt.
   *
   * https://ethereum.stackexchange.com/a/45967/620
   *
   * @param receipt Transaction receipt
   */
  isSuccessfulTransaction(receipt: any): boolean {
    if (receipt.status === '0x1' || receipt.status === 1) {
      return true;
    } else {
      return false;
    }
  }

  disconnectMetaMask() {
    // TODO: disconnect?
  }

  /**
   * Helper method to indicate if a MetaMask wallet is active.
   */
  isWalletActive() {
    return this.isMetaMaskInstalled() && Boolean(this.currentAccount);
  }

  getChainWatcher(): Observable<any> {
    if (!this.isMetaMaskInstalled()) {
      return of(-1);
    }

    return this.chainIdWatcher;
  }

  getChainId(): number {
    return parseInt(this.chainId, 16);
  }

  async getChainIdAsync(): Promise<number> {
    const chainId = await window.ethereum.request({ method: 'eth_chainId' });
    return parseInt(chainId, 16);
  }

  getChainName(): string {
    const chainId = this.getChainId();

    return CHAIN_NAMES[chainId];
  }

  getConnectedWallet(): string {
    return this.currentAccount;
  }

  getAccounts(): Observable<any> {
    if (!this.isMetaMaskInstalled()) {
      return of([]);
    }

    return this.accountWatcher;
  }

  getBalance = async (): Promise<number> => {
    const res = await this.requireChain('goerli');
    if (!res.status) {
      throw new Error(res.message);
    }

    const wei = await window.web3.eth.getBalance(this.currentAccount);
    const eth = Number(window.web3.utils.fromWei(wei));

    return await this.convertETHtoUSD(eth);
  };

  isMetaMaskInstalled() {
    return MetaMaskOnboarding.isMetaMaskInstalled();
  }

  beginMetaMaskOnboarding() {
    if (this.isMetaMaskInstalled()) {
      console.log('MetaMask is already installed. No onboarding required.');
      return;
    }

    this.metaMaskOnboarder.startOnboarding();
  }

  endMetaMaskOnboarding() {
    if (!this.isMetaMaskInstalled()) {
      console.log('MetaMask is not installed. Something went wrong during onboarding. Are you sure you want to stop?');
      return;
    }

    this.metaMaskOnboarder.stopOnboarding();
  }

  requireChain(name: string) {
    return this.switchChain(this.getChainHexByName(name));
  }

  private setupObservablesForEthereum() {
    this.setupChainIdWatcher();
    this.setupAccountWatcher();
  }

  private setupChainIdWatcher() {
    this.chainIdWatcher = new Observable((observer: Observer<any>) => {
      window.ethereum.request({ method: 'eth_chainId' }).then((chainId) => {
        this.chainId = chainId;
        console.log(`Chain Id ${this.getChainId()}`);

        this.chainIdObserver = observer;
        window.ethereum.request({ method: 'eth_chainId' }).then((_chainId) => {
          this.chainId = _chainId;
          observer.next(_chainId);
        });
      });

      window.ethereum.on('chainChanged', (_chainId) => {
        console.warn(`Chain was changed! Was this intentional? Changed to ${_chainId}`);
        this.chainId = _chainId;
        this.ngZone.run(() => {
          // this.router.navigate(['/chain-id-change']);
        });
        observer.next(_chainId);
      });
    });

    this.chainIdWatcher.subscribe(); // if we don't subscribe to it at least once, then it never triggers
  }

  private async mockTypedData(): Promise<VenlyEIP712MetaTransaction> {
    return {
      types: {
        MetaTransaction: [
          {
            type: 'uint256',
            name: 'nonce'
          },
          {
            type: 'address',
            name: 'from'
          },
          {
            type: 'bytes',
            name: 'functionSignature'
          }
        ],
        EIP712Domain: [
          {
            type: 'string',
            name: 'name'
          },
          {
            type: 'string',
            name: 'version'
          },
          {
            type: 'address',
            name: 'verifyingContract'
          },
          {
            type: 'bytes32',
            name: 'salt'
          }
        ]
      },
      domain: {
        chainId: await this.getChainIdAsync(),
        name: 'New Collection 10',
        version: '1',
        verifyingContract: '0xd997fabb09e48c24714247e2e8e6f4dfbc7a326d',
        salt: '0x0000000000000000000000000000000000000000000000000000000000013881'
      },
      primaryType: 'MetaTransaction',
      message: {
        nonce: 0,
        from: '0x7b296d43ca8f1792f52d3f425351edd34da78c34',
        functionSignature: '0xa22cb46500000000000000000000000072C38DFF5Deb65F019f547170dEDd946104d573D0000000000000000000000000000000000000000000000000000000000000001'
      }
    };
  }

  private setupAccountWatcher() {
    this.accountWatcher = new Observable((observer: Observer<any>) => {
      this.accountObserver = observer;
      window.ethereum.request({ method: 'eth_accounts' }).then((_accounts) => {
        this.updateAccount(_accounts);
        observer.next(_accounts);
      });

      window.ethereum.on('accountsChanged', (_accounts) => {
        this.updateAccount(_accounts);
        observer.next(_accounts);
      });
    });

    this.accountWatcher.subscribe(); // if we don't subscribe to it at least once, then it never triggers
  }

  private updateAccount(accounts) {
    if (accounts.length === 0) {
      // MetaMask is locked or the user has not connected any accounts
      this.currentAccount = null;
      this.purgeCache();
    } else if (accounts[0] !== this.currentAccount) {
      this.currentAccount = accounts[0];
      const formData = new FormData();
      formData.append('walletAddress', accounts[0]);
      this.authService.updateWalletAddresses(formData).subscribe();
    }

    this.updateCache();
  }

  private restoreState() {
    const cachedAccount = localStorage.getItem('currentAccount');
    const cachedTimestamp = localStorage.getItem('accountLastActive');

    if (Boolean(cachedAccount && cachedTimestamp) === false) {
      return;
    }

    const diffInMillis = Date.now() - Date.parse(cachedTimestamp);
    if (Math.floor(diffInMillis / 1000 / 60 / 60) > WalletService.maxCachedHours) {
      this.purgeCache();
    } else {
      this.currentAccount = cachedAccount;
    }
  }

  private purgeCache() {
    localStorage.removeItem('currentAccount');
    localStorage.removeItem('accountLastActive');
  }

  private updateCache() {
    localStorage.setItem('currentAccount', this.currentAccount);
    localStorage.setItem('accountLastActive', Date.now().toString());
  }

  private getEthPriceInUsd = (): Observable<any> =>
    this.httpClient.get('https://min-api.cryptocompare.com/data/pricemulti?fsyms=ETH,Matic&tsyms=USD&api_key=73d2826f96e11b3b5b7c1825c3de6b59e396eb726d5d434cfdc2f880cd4b373e');

  private convertETHtoUSD = async (eth: number): Promise<number> => {
    const res = await this.getEthPriceInUsd.call(this).toPromise();
    return eth * res.ETH.USD;
  };

  private switchChain = async (chainId: string): Promise<{ status: boolean; message: string }> => {
    try {
      await window.web3.currentProvider.request({
        method: 'wallet_switchEthereumChain',
        params: [{ chainId }]
      });
      return {
        status: true,
        message: 'Successfully changed!'
      };
    } catch (err) {
      return {
        status: false,
        message: err.message
      };
    }
  };
}
