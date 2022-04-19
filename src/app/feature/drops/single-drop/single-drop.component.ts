import { CountdownComponent, CountdownConfig } from 'ngx-countdown';
import { ErrorsService } from './../../../core/errors/errors.service';
import { NftCardModel } from 'app/core/models/nft-card.model';
import { ProductService } from 'app/core/product/product.service';
import { BsModalRef, BsModalService, ModalOptions } from 'ngx-bootstrap/modal';
import { WizardDialogService } from 'app/shared/wizard-dialog-service/wizard-dialog.service';
import { WalletService } from './../../../core/wallet/wallet.service';
import { NftUtilsService } from './../../../shared/nft-utils.service';
import { DropService } from './../drop.service';
import { ActivatedRoute, Route, Router } from '@angular/router';
import { Component, OnDestroy, OnInit, ViewChild, ViewEncapsulation } from '@angular/core';
import { NftDrop } from 'app/core/models/nft-drop.model';
import { Role } from 'app/core/models/role';
import { FormBuilder, FormControl, FormGroup, Validators, AbstractControl, ValidationErrors, ValidatorFn } from '@angular/forms';
import { JQueryService } from 'app/shared/jquery.service';
import { User } from 'app/core/user/user.types';
import { AuthService } from 'app/core/auth/auth.service';
import Swal from 'sweetalert2/dist/sweetalert2.js';
import { SmartContractVerification } from 'app/core/models/smart-contract-verification.model';
import { connectStorageEmulator } from 'firebase/storage';
import { List } from 'lodash';
import _ from 'lodash';
import { WizardStage } from 'app/shared/wizard-dialog-service/wizard-stage.model';
import { MintPopUpComponent } from '../mint-pop-up/mint-pop-up.component';
import { VenlyWalletNft } from 'app/core/models/venly/venly-wallet-nft.model';
import { Observable, Subscription } from 'rxjs';
import { environment } from 'environments/environment';

const Web3EthContract = require('web3-eth-contract');

let window: any;

// eslint-disable-next-line prefer-arrow/prefer-arrow-functions
export function smartContractValidator(component: SingleDropComponent): ValidatorFn {
  return (control: AbstractControl): ValidationErrors | null => {
    let valid = false;
    const contractStatus = component.smartContractVerified;
    if (contractStatus.areOwner && contractStatus.hasMintRole && contractStatus.hasMint) {
      // We don't require mintBatch for right now.
      valid = true;
    } else {
    }
    return !valid ? { invalidSmartContract: { value: control.value } } : null;
  };
}

// eslint-disable-next-line prefer-arrow/prefer-arrow-functions
export function whitelistValidator(component: SingleDropComponent): ValidatorFn {
  return (control: AbstractControl): ValidationErrors | null => {
    const whitelistStatus = component.whitelistVerified;
    return whitelistStatus ? null : { invalidWhitelist: { value: control.value } };
  };
}

interface GasOracleResponse {
  LastBlock: string; // "14250725",
  SafeGasPrice: string; // "159",
  ProposeGasPrice: string; // "160",
  FastGasPrice: string; // "160",
  suggestBaseFee: string; // "158.284722557",
  gasUsedRatio: string; // "0.919355418252942,0.802333566666667,0.130155366666667,0.208313,0.102785433333333"
}

const dynamicStyleUrl = environment.app === 'BKCN' ? './single-drop.component.bkcn.scss' : './single-drop.component.mcl.scss';
@Component({
  selector: 'app-single-drop',
  templateUrl: './single-drop.component.html',
  encapsulation: ViewEncapsulation.None,
  styleUrls: [dynamicStyleUrl]
})
export class SingleDropComponent implements OnInit, OnDestroy {
  ready: boolean = false;
  drop: NftDrop = {
    name: '',
    description: '',
    image: '', // if a file, must be programatically set to '' only or file
    user: {
      _id: '',
      username: '',
      firstName: '',
      lastName: '',
      usernameOrEmail: '',
      role: Role.User
    },
    smartContractAddress: undefined,
    contractName: '',
    chain: 'mumbai',
    standardTokens: 0,
    premiumTokens: 0,
    premiumTokenIds: [],
    reservationNumber: 0,
    paymentOwner: null,
    currentMint: 0,
    price: 0.0,
    currency: '',
    mints: [],
    sections: [],
    whitelist: undefined,
    whitelistUrl: '',
    launchDateTime: null,
    publicDateTime: null
  };

  _id: number;

  activePanel = 'drop-0';
  mint: any = {
    quantity: 1,
    disabled: true,
    alreadyMinted: false
  };

  isWhitelisted: boolean = false;
  agreeToTermsOfService: boolean = false;
  agreeToPayMintFees: boolean = false;

  editor: any = {
    title: 'Make Up a Title',
    // eslint-disable-next-line max-len
    markdown:
      '## A Heading (h2) \n Here is an example of some body. \n 1. I have some points to make \n 2. You should fill this out. \n * Just an unordered list. \n * of some items'
  };

  lastMintResults: any;

  smartContractVerified: SmartContractVerification = {
    exists: false,
    areOwner: false,
    hasMintRole: false,
    hasMint: false,
    hasMintBatch: false
  };

  whitelistVerified: any = {
    googleSpreadsheetExists: false,
    isFormatted: false
  };

  user: User;

  bannerImage: any = '';
  bannerImageFile: any;
  file: File;

  creationMode: boolean = false;
  creationFormGroup: FormGroup;

  modalRef: BsModalRef;

  contractNftsForUser: NftCardModel[] = [];
  walletAddress: any;
  dropSubscription: Subscription;

  kill: boolean = false;

  countDownConfig: any;
  gasOracle: GasOracleResponse;

  proposedGasFeeForSingleMint: number = 0.0;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private dropService: DropService,
    private jQueryService: JQueryService,
    private utilsService: NftUtilsService,
    private formBuilder: FormBuilder,
    private walletService: WalletService,
    private authService: AuthService,
    private nftUtilsService: NftUtilsService,
    private wizardService: WizardDialogService,
    private modalService: BsModalService,
    private productService: ProductService,
    private snackBarService: ErrorsService
  ) {
    const tenMinuteOffset = 10 * 60 * 1000;
    this.drop.launchDateTime = this.nftUtilsService.getLocalDateTimeNow(0);
    this.drop.publicDateTime = this.nftUtilsService.getLocalDateTimeNow(tenMinuteOffset);

    this.setupForm();
  }

  ngOnInit(): void {
    this.walletAddress = this.walletService.getConnectedWallet();
    const childPath = this.route.snapshot.url[0].path;

    if (childPath.toLowerCase() === 'create') {
      this.setupCreateMode();
    } else {
      // all other child routes should map to here.
      this.setupReadOnly(childPath);
    }
  }

  ngOnDestroy(): void {
    this.kill = true;
    if (this.dropSubscription) {
      this.dropSubscription.unsubscribe();
      this.dropService.killPoll();
    }
  }

  isWalletActive(): boolean {
    return this.walletService.isWalletActive();
  }

  isAdmin(): boolean {
    return this.authService.isAdmin();
  }

  setupForm() {
    const options = {
      hideRequired: false,
      floatLabel: 'auto'
    };

    this.creationFormGroup = this.formBuilder.group({
      name: [{ value: '', disabled: true }, Validators.required],
      description: [{ value: '', disabled: true }, Validators.required],
      image: [{ value: '', disabled: true }, Validators.required],
      fakeImage: [{ value: '', disabled: true }, Validators.required],
      standardTokens: [{ value: '', disabled: true }, Validators.required],
      premiumTokens: [{ value: '', disabled: true }, Validators.required],
      premiumTokenIds: [{ value: '', disabled: true }, Validators.required],
      reservationNumber: [{ value: '', disabled: true }, Validators.required],
      price: [{ value: '', disabled: true }, Validators.required],
      currency: [{ value: '', disabled: true }, Validators.required],
      smartContractAddress: [{ value: '0x02398420398493208', disabled: true }, smartContractValidator(this)],
      whitelist: [{ value: '', disabled: true }, whitelistValidator(this)],
      whitelistUrl: [{ value: '', disabled: true }, Validators.required],
      chain: [{ value: '', disabled: true }, Validators.required]
    });
  }

  async checkWhitelist($event) {
    const googleSheetId = this.creationFormGroup.controls.whitelist.value;
    this.dropService.fetchWhitelist(googleSheetId).subscribe(
      (whitelistResult) => {
        if (whitelistResult.error) {
          this.whitelistVerified.googleSpreadsheetExists = false;
          this.whitelistVerified.isFormatted = false;
          return;
        }

        if (whitelistResult.googlesheet) {
          this.whitelistVerified.googleSpreadsheetExists = true;

          const whitelist = whitelistResult.whitelist;
          const headers = whitelistResult.headers;
          if (whitelist && headers && whitelist.length >= 1) {
            this.whitelistVerified.isFormatted = true;
          }
        }
      },
      (error) => {
        this.whitelistVerified.googleSpreadsheetExists = false;
        this.whitelistVerified.isFormatted = false;
      }
    );
  }

  addSection() {
    this.drop.sections.push({
      title: this.editor.title,
      markdown: this.editor.markdown
    });
  }

  deleteSection(index: number) {
    this.drop.sections.splice(index, 1);
  }

  async checkSmartContract($event) {
    const contractAddress = this.creationFormGroup.controls.smartContractAddress.value;
    const cachedStatus = this.nftUtilsService.getContractStatus(contractAddress);
    const chainId = this.walletService.getChainId();

    if (false) {
      // cachedStatus) {
      console.log(`cached contract for ${contractAddress}${chainId}`);
      this.smartContractVerified = cachedStatus;
      this.creationFormGroup.controls.smartContractAddress.updateValueAndValidity();
      return;
    }

    this.smartContractVerified = new SmartContractVerification(false, false, false, false, false);

    if (!contractAddress || contractAddress.length !== '0x0cEf810600Fd6C973F971F807a767F1204B4De1e'.length) {
      console.log('Invalid address length; not querying API');
      return;
    }

    const chain = this.walletService.getChainName();
    const abi = await this.checkAbiAndUpdate(contractAddress, chain);

    if (!abi) {
      return;
    }

    const contractName = this.getContractNameForNetwork();
    console.log(`Contract name is ${contractName}`);
    await this.checkOwnerAndUpdate(abi, contractAddress);

    await this.checkMinterRoleAndUpdate(abi, contractAddress);

    this.nftUtilsService.setContractStatus(contractAddress, this.smartContractVerified);
    this.creationFormGroup.controls.smartContractAddress.updateValueAndValidity();
  }

  async getContractNameForNetwork() {
    const chain: string = this.drop.chain;
    let contractName = 'MegaTokens';
    if (chain === 'rinkeby' || chain === 'goerli' || chain === 'ethereum') {
      contractName = 'MegaTokens';
    } else if (chain === 'polygon' || chain === 'mumbai' || chain === 'matic') {
      contractName = 'ChildMegaTokens';
    }

    return contractName;
  }

  async checkOwnerAndUpdate(abi, contractAddress) {
    const result = await this.fetchOwner(abi, contractAddress);

    if (!Boolean(result)) {
      return;
    }

    const connectedWallet = this.walletService.getConnectedWallet();
    if (result.toUpperCase() === connectedWallet.toUpperCase()) {
      this.smartContractVerified.areOwner = true;
    }
  }

  async checkMinterRoleAndUpdate(abi, contractAddress) {
    const connectedWallet = this.walletService.getConnectedWallet();
    const result = await this.hasMinterRole(connectedWallet, abi, contractAddress);

    if (!Boolean(result)) {
      return;
    }

    if (result) {
      this.smartContractVerified.hasMintRole = true;
    }
  }

  async checkAbiAndUpdate(contractAddress, chain): Promise<any> {
    let abi;
    try {
      abi = await this.nftUtilsService.getVerifiedContractAbi(contractAddress, chain).toPromise();
    } catch (response) {
      const error = response.error;
      console.log('this contract address threw an error', error.message);
    }

    if (!Boolean(abi)) {
      this.smartContractVerified.exists = false;
      return;
    }

    if (abi.length > 0) {
      this.smartContractVerified.exists = true;
    }

    const mintFunctions = {};
    // eslint-disable-next-line @typescript-eslint/prefer-for-of
    for (let i = 0; i < abi.length; i++) {
      const item = abi[i];
      const name = item.name;
      if (name && name.includes('mint')) {
        mintFunctions[name] = true;
      }
    }

    if (mintFunctions['mint']) {
      this.smartContractVerified.hasMint = true;
    }
    if (mintFunctions['mintBatch']) {
      this.smartContractVerified.hasMintBatch = true;
    }

    return abi;
  }

  async interactWithContract(abi: any, contractAddress: string) {
    // Fetched the abi using EtherscanAPI; smart contract must be verified.
    const web3 = this.walletService.getWeb3();

    const provider = web3.currentProvider;
    Web3EthContract.setProvider(provider);

    const contract = new Web3EthContract(abi, contractAddress);
    const response = await contract.methods.owner().call(); // this works.

    const contractInstance = new web3.eth.Contract(abi, contractAddress);
    const secondResponse = await contractInstance.methods.owner().call();

    return `${response} | ${secondResponse}`;
  }

  async fetchOwner(abi: any, contractAddress: string) {
    let response = '';
    try {
      const web3 = this.walletService.getWeb3();
      const provider = web3.currentProvider;
      Web3EthContract.setProvider(provider);

      const contract = new Web3EthContract(abi, contractAddress);
      response = await contract.methods.owner().call(); // this works.
    } catch (responseError) {
      const error = responseError.error;
      console.error('Error trying to fetch owner', error);
    }

    return response;
  }

  async hasMinterRole(address: string, abi: any, contractAddress: string) {
    let response = '';
    try {
      const web3 = this.walletService.getWeb3();
      const provider = web3.currentProvider;
      Web3EthContract.setProvider(provider);

      const contract = new Web3EthContract(abi, contractAddress);
      const minterRoleK256 = '0x9f2df0fed2c77648de5860a4cc508cd0818c85b8b8a1ab4ceeef8d981c8956a6'; // keccak256('MINTER_ROLE')
      response = await contract.methods.hasRole(minterRoleK256, address).call(); // this works.
    } catch (responseError) {
      const error = responseError.error;
      console.error('Error trying to fetch owner', error);
    }

    return response;
  }

  onChangeBannerImage(fileChangeEvent: any) {
    this.file = fileChangeEvent.target.files[0];
    this.creationFormGroup.patchValue({
      image: this.file
    });

    const onLoad = (onloadEvent: any) => {
      this.bannerImage = onloadEvent.target.result; // UI element
      this.bannerImageFile = fileChangeEvent.target.files[0];
    };

    const onError = (errorEvent: any) => {
      console.log(`File could not be read: ${errorEvent.target.error.code}`);
    };

    this.utilsService.setupReadAsDataURL(fileChangeEvent, onLoad, onError);
  }

  createFormDataFromDrop(): FormData {
    const form = this.creationFormGroup;
    const formData = new FormData();
    const paymentOwner = this.walletService.getConnectedWallet();
    formData.append('name', form.value.name);
    formData.append('description', form.value.description);
    formData.append('fakeImage', form.value.fakeImage);
    formData.append('image', form.value.image);
    formData.append('standardTokens', form.value.standardTokens);
    formData.append('premiumTokens', form.value.premiumTokens);
    formData.append('premiumTokenIds', form.value.premiumTokenIds);
    formData.append('reservationNumber', form.value.reservationNumber);
    formData.append('price', form.value.price);
    formData.append('currency', form.value.currency);
    formData.append('smartContractAddress', form.value.smartContractAddress);
    formData.append('whitelist', form.value.whitelist);
    formData.append('whitelistUrl', form.value.whitelistUrl);
    formData.append('paymentOwner', paymentOwner);
    formData.append('chain', this.walletService.getChainName());
    formData.append('sections', JSON.stringify(this.drop.sections));

    // We must convert to UTC before we persist in the backend!
    const launchDate = new Date(this.drop.launchDateTime);
    const launchDateUtc = launchDate.toISOString();

    const publicDate = new Date(this.drop.publicDateTime);
    const publicDateUtc = launchDate.toISOString();

    formData.append('launchDateTime', launchDateUtc);
    formData.append('publicDateTime', publicDateUtc);

    const fileExtensionRegEx = /(?:\.([^.]+))?$/;
    const fileName = this.bannerImageFile.name;
    const constructedFile = {
      name: fileName,
      data: this.file,
      mimetype: `image/${fileExtensionRegEx.exec(fileName)}`
    };

    formData.append('constructedFile', constructedFile.data, constructedFile.name);
    return formData;
  }

  createDrop(): void {
    if (this.creationFormGroup.invalid) {
      alert('Form is invalid!');
    } else {
      const formData = this.createFormDataFromDrop();
      this.dropService.createDrop(formData).subscribe(
        (hydratedDrop: { message: string; data: NftDrop }) => {
          this.router.navigate(['drops', hydratedDrop.data._id]);
        },
        (response: { error: any }) => {
          Swal.fire({
            icon: 'error',
            title: `There was an error trying to create the drop! ${response.error}`,
            showConfirmButton: true,
            timer: 3000,
            background: '#5b5353',
            iconColor: 'red'
          });
        }
      );
    }
  }

  async mintNftDrop(): Promise<any> {
    const chain = this.walletService.getChainName();
    const confirmations = 2;
    if (chain !== 'rinkeby' && chain !== 'ethereum') {
      this.snackBarService.openSnackBarTop('Please select Rinkeby for testing or Ethereum for mainnet', 'Wrong Chain', 2500, false);
      return;
    }

    const gasFeeForSingleMint = this.proposedGasFeeForSingleMint; // Capture the fee when they start minting. Do not let it dynamically change.
    this.mint.disabled = true;

    const to = this.walletService.getConnectedWallet();
    const quantity = this.mint.quantity;

    const price = this.drop.price;

    const totalEtherCost = price + gasFeeForSingleMint;
    const cost = `${price} + ${gasFeeForSingleMint}`;

    this.showWizardDialog(quantity, cost, confirmations);
    await this.nftUtilsService.delay(500);
    const paymentDestination = this.drop.paymentOwner;

    const onSuccess = async (transactionReceipt) => {
      console.log('Transaction receipt for ether send:', transactionReceipt);
      this.wizardService.advanceStages();

      // Simulate stage 2: Preparing NFTs
      await this.nftUtilsService.delay(1500);
      this.wizardService.advanceStages();

      // Proceed to Stage 3: minting.
      console.log(`Minting ${quantity} for contract ${this.drop.smartContractAddress}@${this.drop.chain}`);

      const paymentTxHash = transactionReceipt.tx;
      try {
        const result = await this.dropService.mintDrop(paymentTxHash, quantity, to, this.drop._id, this.drop.smartContractAddress, this.drop.chain).toPromise();
        this.wizardService.advanceStages();
        this.buildResults(result);
      } catch (response) {
        const error = response.error;
        console.error('Error trying to mint', error.message);
        this.wizardService.failStage(error.message);
      }

      this.mint.disabled = false;
    };

    const onError = (error) => {
      this.wizardService.failStage(error.message);
      console.log('There was an error during the send ether payment.', error);
      this.mint.disabled = false;
    };

    this.dropService.requestEtherPayment(totalEtherCost, paymentDestination, confirmations, onSuccess, onError);
  }

  /** This method requires that gasOracle exists. To be used as a helper during response from EtherScan API's Gas Oracle */
  calculateEtherGasFeeForSingleMint(): number {
    const gasCostForMintTransaction: number = this.dropService.getGasCostForMintTransaction();
    const gasOracle = this.gasOracle;

    if (!Boolean(gasOracle)) {
      return 0.0;
    }

    const gasPriceInGweiPerUnit = parseInt(gasOracle.ProposeGasPrice, 10);

    const gasFeeForSingleMintGwei = gasCostForMintTransaction * gasPriceInGweiPerUnit;
    const gasFeeForSingleMintEther = 0.000000001 * gasFeeForSingleMintGwei;

    this.proposedGasFeeForSingleMint = parseFloat(gasFeeForSingleMintEther.toFixed(6)); // set to 6 decimal places
    return gasFeeForSingleMintEther;
  }

  async fetchGasOraclePricePerUnit(): Promise<GasOracleResponse> {
    const interval = 1000;
    const gasOraclePromise = new Promise(async (res, rej) => {
      let attempts = 0;
      while (!Boolean(this.gasOracle) && attempts <= 5) {
        await this.nftUtilsService.delay(interval);
        attempts += 1;
      }

      if (Boolean(this.gasOracle)) {
        res(this.gasOracle);
      } else {
        rej(`Failed to get gasOracle after ${attempts} attempts`);
      }
    });

    await gasOraclePromise;

    return this.gasOracle;
  }

  buildResults(result: any) {
    const body = result.data.body;
    this.lastMintResults = result;
    const tokenIds = body.tokenIds;
    const contractAddress = body.contractAddress;
    const transactions = result.data.transactions;

    const config: ModalOptions = {
      class: 'nft-drop-mint-container',
      initialState: {
        tokenIds,
        contractAddress,
        transactions,
        chain: this.drop.chain
      }
    };

    this.modalRef = this.modalService.show(MintPopUpComponent, config);
    this.getNftsForWallet(contractAddress);
  }

  getNftsForWallet(contractAddress: string) {
    let nfts = [];
    this.productService.listingNFT().subscribe(
      (data) => {
        if (Boolean(data.data) === false) {
          nfts = [];
        } else {
          data.data.forEach((nft: VenlyWalletNft) => {
            const nftCard: NftCardModel = this.nftUtilsService.buildNftCardFromVenlyWalletNft(nft);

            if (nft.contract.address.toUpperCase() === contractAddress.toUpperCase()) {
              nfts.push(nftCard);
            }
          });
        }
        const wallet = this.walletService.getConnectedWallet();
        this.contractNftsForUser = nfts;
      },
      (error) => {
        alert('something went wrong while fetching NFTs for user and contract.' + error.toString());
      }
    );
  }

  async checkAddressInWhitelist(): Promise<boolean> {
    const googleSheetId = this.drop.whitelist;
    const minter = this.walletService.getConnectedWallet();
    let whitelisted = false;
    try {
      const whitelistResult = await this.dropService.fetchWhitelist(googleSheetId).toPromise();
      const whitelist = whitelistResult.whitelist;
      whitelisted = Boolean(whitelist.findIndex((address: string) => address.toUpperCase() === minter.toUpperCase()) >= 0);
    } catch (response) {
      const error = response.error;
      console.error('Error attempting to fetch whitelist for drop!', error);
      whitelisted = false;
    }

    return whitelisted;
  }

  inputChangeHandler(event: any): void {
    this.jQueryService.resizeTextarea(event);
  }

  /**
   * Let P = # of Premium NFTs
   * Let S = # of Standard NFTs
   * Let R = # of reserved Standard NFTs
   * All tokenIds from 1 to (P+S) are immediately available.
   * P_R := Drop creator specifies an array of tokenIds to be reserved for premium
   * Backend randomly selects R tokenIds from remaining pool of NFTs from 1 to (P+S) - P_R
   * Let C = A randomized set of tokenIds of size R.
   * Set C is taken from 1 to (P+S) - P_R
   * When minting occurs for Standard NFTs, the pool of tokenIds in C and P_R are removed from eligibility.
   * C is reserved when Drop is created. P_R is also reserved when Drop is created.
   */
  calculateRemainingMints(): number {
    const dropSize = this.drop.standardTokens + this.drop.premiumTokens;

    const remaining = dropSize - this.drop.mints.length;

    this.mint.remaining = remaining;

    return remaining;
  }

  navigateToWhitelist() {
    window.open(this.drop.whitelistUrl, '_blank');
  }

  isMintDisabled() {
    const launched = this.hasDateTimeElapsed(this.drop.launchDateTime);
    const whitelistRestrictionEnforced = this.isWhitelistRestrictionEnforced();

    const mintGasFeesNotCalculated = Boolean(this.proposedGasFeeForSingleMint === 0.0);
    const mintDisabled =
      !launched ||
      this.mint.disabled ||
      mintGasFeesNotCalculated ||
      this.mint.alreadyMinted ||
      (whitelistRestrictionEnforced && !this.isWhitelisted) ||
      this.mint.remaining <= 0 ||
      !this.agreeToTermsOfService ||
      !this.agreeToPayMintFees;

    return mintDisabled;
  }

  isEligibleToMint() {
    return !this.isWhitelistRestrictionEnforced() || (this.isWhitelistRestrictionEnforced() && this.isWhitelisted);
  }

  hasDateTimeElapsed(datetime: string) {
    const deadlineDate = new Date(datetime);
    const deadlineTime = deadlineDate.getTime();

    const nowDate = new Date();
    const nowTime = nowDate.getTime();

    const deadlineUtcTime = deadlineDate.toISOString();
    const nowUtcTime = nowDate.toISOString();

    // console.log(`Now: ${nowDate.toString()} | Deadline: ${deadlineDate.toString()} | DeadlineInUTC: ${deadlineUtcTime.toString()} | NowUTC: ${nowUtcTime.toString()}`);

    if (nowTime >= deadlineTime) {
      return true;
    }

    return false;
  }

  isWhitelistRestrictionEnforced() {
    const deadline = new Date(this.drop.publicDateTime).getTime();
    const now = Date.now();
    if (now >= deadline) {
      this.isWhitelisted = true;
      return false;
    }

    return true;
  }

  private showWizardDialog(quantity: number, price: string, confirmations: number) {
    const stages: WizardStage[] = [
      {
        name: 'Payment',
        status: 'dormant',
        description: `Sending payment of ${price} ETH (cost and gas fees) and waiting for ${confirmations} confirmations.`
      },
      {
        name: 'Preparing',
        status: 'dormant',
        description: `Preparing to mint ${quantity} Book(s).`
      },
      {
        name: 'Minting',
        status: 'dormant',
        description: 'Executing mint on the blockchain.'
      }
    ];

    this.wizardService.showWizard('Printing your Book to the Blockchain', stages, true);
  }

  private async setupCreateMode(): Promise<void> {
    this.ready = true;
    this.creationFormGroup.enable();
    this.creationMode = true;
    this.drop.user = this.authService.user;

    this.walletService.getChainWatcher().subscribe((chainId) => {
      const chain = this.walletService.getChainName();
      console.log(`setting chain on drop to ${chain}`);
      this.drop.chain = chain;
      this.creationFormGroup.controls.chain.disable();
    });
  }

  private setupReadOnly(childPath: string): void {
    this.creationFormGroup.disable();
    const id = this.route.snapshot.params['id'];
    this._id = id;
    if (id && id.match(/^[0-9a-z]+$/)) {
      // kill drop if it exists.
      if (this.dropSubscription) {
        this.dropSubscription.unsubscribe();
        this.dropService.killPoll();
      }
      this.dropSubscription = this.dropService.fetchDrop(id).subscribe((response: { message: string; data: NftDrop }) => {
        this.drop = response.data;
        this.ready = true;
        this.getNftsForWallet(this.drop.smartContractAddress);
        this.setupDropPoller();
        this.setupGasPoller();

        const onSuccess = () => {
          this.mint.disabled = false;
        };

        this.setupWhitelistPoller(onSuccess);
      });
    } else {
      console.log(`Not sure where you were trying to go, but ${childPath} is not an option ;)`);
    }
  }

  private setupDropPoller() {
    this.dropService.pollDrops().subscribe((response: { message: string; data: List<NftDrop> }) => {
      const target = _.find(response.data, (drop) => drop._id === '' + this._id);
      this.drop.mints = target.mints;
      this.checkMints();
    });
  }

  private setupGasPoller() {
    this.dropService.pollGasOracle().subscribe((gasOracleResponse) => {
      this.gasOracle = gasOracleResponse.data.result;
      this.calculateEtherGasFeeForSingleMint();
    });
  }

  private checkMints() {
    // Feature request: don't restrict mint limits after public launch.
    if (this.hasDateTimeElapsed(this.drop.publicDateTime)) {
      this.mint.alreadyMinted = false;
      return;
    }

    const address = this.walletService.getConnectedWallet();
    let index = -1;

    if (Boolean(address)) {
      index = this.drop.mints.findIndex((mint) => mint.recipient.toUpperCase() === address.toUpperCase());
    }

    if (index >= 0) {
      this.mint.alreadyMinted = true;
    } else {
      this.mint.alreadyMinted = false;
    }
  }

  private async setupWhitelistPoller(callback = () => {}) {
    if (this.kill) {
      return;
    }

    const whitelisted = await this.checkAddressInWhitelist();
    this.isWhitelisted = whitelisted;

    if (this.kill) {
      return;
    }

    callback();
    setTimeout(() => {
      if (this.kill) {
        return;
      }
      this.setupWhitelistPoller();
    }, 10000);
  }
}
