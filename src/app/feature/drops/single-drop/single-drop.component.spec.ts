import { BsModalService, ModalOptions } from 'ngx-bootstrap/modal';
import { ComponentFixture, fakeAsync, flush, TestBed } from '@angular/core/testing';
import { FormBuilder } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { AuthService } from 'app/core/auth/auth.service';
import { WalletService } from 'app/core/wallet/wallet.service';
import { JQueryService } from 'app/shared/jquery.service';
import { NftUtilsService } from 'app/shared/nft-utils.service';
import { WizardDialogService } from 'app/shared/wizard-dialog-service/wizard-dialog.service';
import { DropService } from '../drop.service';

import { SingleDropComponent, smartContractValidator, whitelistValidator } from './single-drop.component';
import { ProductService } from 'app/core/product/product.service';
import { ErrorsService } from 'app/core/errors/errors.service';
import { of, Subscription, throwError } from 'rxjs';
import { SmartContractVerification } from 'app/core/models/smart-contract-verification.model';
import { mockedMintItem, mockedNftDrop, stages } from '../spec-files/mocked';
import Swal from 'sweetalert2';
import { MintPopUpComponent } from '../mint-pop-up/mint-pop-up.component';
import { mockedNftCard, mockedvenlyWalletNft } from 'app/core/auction/spec-files/mocked';
import { mock, trigger } from '@depay/web3-mock';

describe('SingleDropComponent', () => {
  let component: SingleDropComponent;
  let fixture: ComponentFixture<SingleDropComponent>;
  const route = jasmine.createSpyObj('Route', ['snapshot']);
  route.snapshot = {
    url: [
      {
        path: 'readonly'
      }
    ],
    params: {
      id: '0x1234sjjmuyw'
    }
  };
  const mockedGasOracle = {
    LastBlock: '14250725',
    SafeGasPrice: '159',
    ProposeGasPrice: '0',
    FastGasPrice: '160',
    suggestBaseFee: '158.284722557',
    gasUsedRatio: '0.919355418252942,0.802333566666667,0.130155366666667,0.208313,0.102785433333333'
  };

  const routerMock = jasmine.createSpyObj('Router', ['navigate']);
  const dropServiceMock = jasmine.createSpyObj('DropService', [
    'killPoll',
    'fetchWhitelist',
    'createDrop',
    'requestEtherPayment',
    'getGasCostForMintTransaction',
    'fetchDrop',
    'pollDrops',
    'pollGasOracle'
  ]);
  const jQueryServiceMock = jasmine.createSpyObj('JQueryService', ['resizeTextarea']);
  const walletServiceMock = jasmine.createSpyObj('WalletService', ['isWalletActive', 'getConnectedWallet', 'getChainId', 'getChainName', 'getWeb3', 'getChainWatcher']);
  walletServiceMock.isWalletActive.and.returnValue(true);
  walletServiceMock.getConnectedWallet.and.returnValue('0x02938049284093');
  const authServiceMock = jasmine.createSpyObj('AuthService', ['isAdmin', 'updateWalletAddresses', 'updateLinkedWalletAddresses']);
  const nftUtilsServiceMock = jasmine.createSpyObj('NftUtilsService', [
    'getLocalDateTimeNow',
    'getContractStatus',
    'setContractStatus',
    'getVerifiedContractAbi',
    'setupReadAsDataURL',
    'delay',
    'buildNftCardFromVenlyWalletNft'
  ]);
  const wizardDialogServiceMock = jasmine.createSpyObj('WizardDialogService', ['showWizard']);
  const bsModalServiceMock = jasmine.createSpyObj('BsModalService', ['show']);
  const productServiceMock = jasmine.createSpyObj('ProductService', ['listingNFT']);
  const snackBarServiceMock = jasmine.createSpyObj('ErrorsService', ['openSnackBarTop']);

  const blockchain = 'ethereum';
  const accounts = ['0xd8da6bf26964af9d7eed9e03e53415d37aa96045', '0xaAaB52F652eB9be0594b03479007272FDB87285C'];

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [SingleDropComponent],
      providers: [
        { provide: ActivatedRoute, useValue: route },
        { provide: Router, useValue: routerMock },
        { provide: DropService, useValue: dropServiceMock },
        { provide: JQueryService, useValue: jQueryServiceMock },
        { provide: FormBuilder },
        { provide: WalletService, useValue: walletServiceMock },
        { provide: AuthService, useValue: authServiceMock },
        { provide: NftUtilsService, useValue: nftUtilsServiceMock },
        { provide: WizardDialogService, useValue: wizardDialogServiceMock },
        { provide: BsModalService, useValue: bsModalServiceMock },
        { provide: ProductService, useValue: productServiceMock },
        { provide: ErrorsService, useValue: snackBarServiceMock }
      ]
    }).compileComponents();
    mock({ blockchain, accounts: { return: accounts } });
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(SingleDropComponent);
    component = fixture.componentInstance;
    component.dropSubscription = new Subscription();
    dropServiceMock.fetchDrop.and.returnValue(of());
    route.snapshot.params.id = '0x1234sjjmuyw';
    fixture.detectChanges();
  });

  afterEach(() => {
    fixture.destroy();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should validate smart contract', () => {
    component.smartContractVerified = new SmartContractVerification(true, true, true, false, true);

    const response = smartContractValidator(component);

    expect(response(component.creationFormGroup)).toBeTruthy();
  });

  it('should return null', () => {
    component.smartContractVerified = new SmartContractVerification(true, true, true, true, true);

    const response = smartContractValidator(component);

    expect(response(component.creationFormGroup)).toBe(null);
  });

  it('should validate whiteList', () => {
    component.whitelistVerified = false;

    const response = whitelistValidator(component);

    expect(response(component.creationFormGroup)).toBeTruthy();
  });

  it('should return null', () => {
    component.whitelistVerified = true;
    const response = whitelistValidator(component);

    expect(response(component.creationFormGroup)).toBe(null);
  });
  describe('IsWalletActive', () => {
    it('should return true', () => {
      walletServiceMock.isWalletActive.and.returnValue(true);

      expect(component.isWalletActive()).toBe(true);
    });

    it('should return false', () => {
      walletServiceMock.isWalletActive.and.returnValue(false);

      expect(component.isWalletActive()).toBe(false);
    });
  });

  describe('IsAdmin', () => {
    it('should return true', () => {
      authServiceMock.isAdmin.and.returnValue(true);

      expect(component.isAdmin()).toBe(true);
    });

    it('should return false', () => {
      authServiceMock.isAdmin.and.returnValue(false);

      expect(component.isAdmin()).toBe(false);
    });
  });

  it('should set up the creation form', () => {
    component.setupForm();

    expect(component.creationFormGroup).toBeTruthy();
    expect(component.creationFormGroup.controls.smartContractAddress.value).toEqual('0x02398420398493208');
  });

  describe('checkWhiteList', () => {
    it('should return back if there is an error on the response', async () => {
      dropServiceMock.fetchWhitelist.and.returnValue(of({ error: 'Some Error!' }));
      const event = 'Some event';

      await component.checkWhitelist(event);

      expect(component.whitelistVerified.googleSpreadsheetExists).toBe(false);
      expect(component.whitelistVerified.isFormatted).toBe(false);
    });

    it('should set values to false if get white list throws an error', async () => {
      dropServiceMock.fetchWhitelist.and.returnValue(throwError('Some Error!'));
      const event = 'Some event';

      await component.checkWhitelist(event);

      expect(component.whitelistVerified.googleSpreadsheetExists).toBe(false);
      expect(component.whitelistVerified.isFormatted).toBe(false);
    });

    it('should set values to true if white list is truthy', async () => {
      const expectedResponse = {
        whitelist: [{}],
        headers: {},
        googlesheet: {}
      };
      dropServiceMock.fetchWhitelist.and.returnValue(of(expectedResponse));
      const event = 'Some event';

      await component.checkWhitelist(event);

      expect(component.whitelistVerified.googleSpreadsheetExists).toBe(true);
      expect(component.whitelistVerified.isFormatted).toBe(true);
    });
  });

  it('should add a section to nft drop', () => {
    component.addSection();

    expect(component.drop.sections[0]).toEqual(component.editor);
  });

  it('should delete a specific section from nft drop', () => {
    component.drop.sections = [component.editor];

    component.deleteSection(0);

    expect(component.drop.sections).toEqual([]);
  });

  describe('CheckSmartContract', () => {
    it('should return if contract address is not valid', () => {
      component.creationFormGroup.controls['smartContractAddress'].setValue('0xkdjhwgd');
      const status = new SmartContractVerification(true, true, true, true, true);
      nftUtilsServiceMock.getContractStatus.and.returnValue(status);
      walletServiceMock.getChainId.and.returnValue(12345);

      component.checkSmartContract('Some Event');

      expect(nftUtilsServiceMock.getContractStatus).toHaveBeenCalled();
      expect(walletServiceMock.getChainId).toHaveBeenCalled();
    });

    it('should return if abi for the given contract is invalid', () => {
      component.creationFormGroup.controls['smartContractAddress'].setValue('0x0cEf810600Fd6C973F971F807a767F1204B4De1e');
      const status = new SmartContractVerification(true, true, true, true, true);
      nftUtilsServiceMock.getContractStatus.and.returnValue(status);
      walletServiceMock.getChainId.and.returnValue(12345);
      walletServiceMock.getChainName.and.returnValue('ethereum');
      const spyAbi = spyOn(component, 'checkAbiAndUpdate').and.resolveTo(null);

      component.checkSmartContract('Some Event');

      expect(spyAbi).toHaveBeenCalled();
      expect(walletServiceMock.getChainName).toHaveBeenCalled();
    });

    it('should set the contract successfully', fakeAsync(() => {
      const address = '0x0cEf810600Fd6C973F971F807a767F1204B4De1e';
      component.creationFormGroup.controls['smartContractAddress'].setValue(address);
      const status = new SmartContractVerification(true, true, true, true, true);
      nftUtilsServiceMock.getContractStatus.and.returnValue(status);
      walletServiceMock.getChainId.and.returnValue(12345);
      walletServiceMock.getChainName.and.returnValue('ethereum');
      const spyAbi = spyOn(component, 'checkAbiAndUpdate').and.resolveTo(['Test Abi']);
      spyOn(component, 'getContractNameForNetwork').and.resolveTo('test Network');
      const spyUpdate = spyOn(component, 'checkOwnerAndUpdate').and.resolveTo();
      const spyMint = spyOn(component, 'checkMinterRoleAndUpdate').and.resolveTo();

      component.checkSmartContract('Some Event');
      flush();

      expect(spyUpdate).toHaveBeenCalledWith(['Test Abi'], address);
      expect(spyMint).toHaveBeenCalled();
    }));
  });

  describe('GetContractNameForNetwork', () => {
    it('should return MegaTokens', async () => {
      component.drop.chain = 'ethereum';

      const response = await component.getContractNameForNetwork();

      expect(response).toEqual('MegaTokens');
    });

    it('should return ChildMegaTokens', async () => {
      component.drop.chain = 'matic';

      const response = await component.getContractNameForNetwork();

      expect(response).toEqual('ChildMegaTokens');
    });
  });

  describe('CheckOwnerAndUpdate', () => {
    it('should return if owner is invalid', fakeAsync(() => {
      const abi = ['Test Abi'];
      const contractAddress = '0xkdsjgwkufilwsduygwui';
      const spyOwner = spyOn(component, 'fetchOwner').and.resolveTo(null);

      component.checkOwnerAndUpdate(abi, contractAddress);
      flush();

      expect(spyOwner).toHaveBeenCalledWith(abi, contractAddress);
    }));

    it('should set true for the owner', fakeAsync(() => {
      const abi = ['Test Abi'];
      const contractAddress = '0xkdsjgwkufilwsduygwui';
      const spyOwner = spyOn(component, 'fetchOwner').and.resolveTo('Test Wallet');
      walletServiceMock.getConnectedWallet.and.returnValue('Test Wallet');

      component.checkOwnerAndUpdate(abi, contractAddress);
      flush();

      expect(spyOwner).toHaveBeenCalledWith(abi, contractAddress);
      expect(component.smartContractVerified.areOwner).toBe(true);
    }));
  });

  describe('CheckMintRoleAndUpdate', () => {
    it('should return if minter role is invalid', fakeAsync(() => {
      const abi = ['Test Abi'];
      const contractAddress = '0xkdsjgwkufilwsduygwui';
      const spyMint = spyOn(component, 'hasMinterRole').and.resolveTo(null);
      walletServiceMock.getConnectedWallet.and.returnValue('Test Wallet');

      component.checkMinterRoleAndUpdate(abi, contractAddress);
      flush();

      expect(spyMint).toHaveBeenCalledWith('Test Wallet', abi, contractAddress);
    }));

    it('should set true for the mint role', fakeAsync(() => {
      const abi = ['Test Abi'];
      const contractAddress = '0xkdsjgwkufilwsduygwui';
      const spyMint = spyOn(component, 'hasMinterRole').and.resolveTo('Test Mint');
      walletServiceMock.getConnectedWallet.and.returnValue('Test Wallet');

      component.checkMinterRoleAndUpdate(abi, contractAddress);
      flush();

      expect(spyMint).toHaveBeenCalledWith('Test Wallet', abi, contractAddress);
      expect(component.smartContractVerified.hasMintRole).toBe(true);
    }));
  });

  describe('CheckAbiAndUpdate', () => {
    it('should log an error and return if verified contract is not received', fakeAsync(() => {
      nftUtilsServiceMock.getVerifiedContractAbi.and.returnValue(throwError({ error: { message: 'Some Error!' } }));
      const contractAddress = '0xkdsjgwkufilwsduygwui';
      const chain = 'ethereum';

      component.checkAbiAndUpdate(contractAddress, chain);
      flush();

      expect(component.smartContractVerified.exists).toBe(false);
    }));

    it('should update mint statuses according to abi', async () => {
      const abi1 = {
        name: 'mint'
      };
      const abi2 = { name: 'mintBatch' };
      const abiResponse = [abi1, abi2];
      nftUtilsServiceMock.getVerifiedContractAbi.and.returnValue(of(abiResponse));
      const contractAddress = '0xkdsjgwkufilwsduygwui';
      const chain = 'ethereum';

      await component.checkAbiAndUpdate(contractAddress, chain);

      expect(component.smartContractVerified.hasMint).toBe(true);
      expect(component.smartContractVerified.hasMintBatch).toBe(true);
      expect(component.smartContractVerified.exists).toBe(true);
    });
  });

  it('should change image', () => {
    const event = { target: { files: [new Blob(['test1.png', 'test2.png', 'test3.png'])], result: 'Test Result' } };

    component.onChangeBannerImage(event);

    expect(nftUtilsServiceMock.setupReadAsDataURL).toHaveBeenCalled();
  });

  it('should create a form from Drop', () => {
    walletServiceMock.getConnectedWallet.and.returnValue('0xbejwkuilqodwqij');
    walletServiceMock.getChainName.and.returnValue('ethereum');
    component.drop.launchDateTime = '2032-02-28';
    component.drop.publicDateTime = '2032-02-28';
    component.bannerImageFile = {
      name: 'test.png'
    };
    component.file = new File([], 'Test');

    const response = component.createFormDataFromDrop();

    expect(response).toBeTruthy();
  });

  describe('Create Drop', () => {
    it('should create a drop and redirect to that drop', () => {
      spyOn(component, 'createFormDataFromDrop').and.returnValue(new FormData());
      dropServiceMock.createDrop.and.returnValue(of({ message: 'Successfully Created!', data: mockedNftDrop }));

      component.createDrop();

      expect(routerMock.navigate).toHaveBeenCalledWith(['drops', mockedNftDrop._id]);
    });

    it('should respond with an alert if drop creation fails', (done) => {
      spyOn(component, 'createFormDataFromDrop').and.returnValue(new FormData());
      dropServiceMock.createDrop.and.returnValue(throwError({ error: 'Some Error!' }));

      component.createDrop();
      setTimeout(() => {
        expect(Swal.isVisible()).toBeTruthy();
        expect(Swal.getTitle().textContent).toEqual('There was an error trying to create the drop! Some Error!');
        Swal.clickConfirm();
        done();
      });
    });

    it('should show a alert if form is invalid', () => {
      component.creationFormGroup.controls['name'].enable();
      component.creationFormGroup.controls['name'].setValue(null);
      spyOn(window, 'alert');

      component.createDrop();

      expect(window.alert).toHaveBeenCalledWith('Form is invalid!');
    });
  });

  describe('Mint Drop', () => {
    it('should return if chain name is invalid', fakeAsync(() => {
      walletServiceMock.getChainName.and.returnValue('matic');

      component.mintNftDrop();
      flush();

      expect(snackBarServiceMock.openSnackBarTop).toHaveBeenCalledWith('Please select Rinkeby for testing or Ethereum for mainnet', 'Wrong Chain', 2500, false);
    }));

    it('should mint nft drop', fakeAsync(() => {
      walletServiceMock.getConnectedWallet.and.returnValue('0xsiuugjakulfiew');
      walletServiceMock.getChainName.and.returnValue('ethereum');

      const spyWizard = spyOn<any>(component, 'showWizardDialog');

      component.mintNftDrop();
      flush();

      expect(spyWizard).toHaveBeenCalled();
      expect(dropServiceMock.requestEtherPayment).toHaveBeenCalled();
    }));
  });

  describe('CalculateEtherGasFeeForSingleMint', () => {
    it('should return 0 if gas oracle is not present', async () => {
      dropServiceMock.getGasCostForMintTransaction.and.returnValue(10);
      component.gasOracle = null;

      const response = await component.calculateEtherGasFeeForSingleMint();

      expect(dropServiceMock.getGasCostForMintTransaction).toHaveBeenCalled();
      expect(response).toEqual(0.0);
    });

    it('should return gas fee for single mint', async () => {
      dropServiceMock.getGasCostForMintTransaction.and.returnValue(0);
      component.gasOracle = mockedGasOracle;

      const response = await component.calculateEtherGasFeeForSingleMint();

      expect(dropServiceMock.getGasCostForMintTransaction).toHaveBeenCalled();
      expect(response).toEqual(0);
    });
  });

  it('should respond with a mint popup with a provided result', () => {
    component.drop.chain = 'ethereum';
    const result = {
      data: {
        body: {
          tokenIds: ['123', '456'],
          contractAddress: 'test Address'
        },
        transactions: []
      }
    };
    const config: ModalOptions = {
      class: 'nft-drop-mint-container',
      initialState: {
        tokenIds: result.data.body.tokenIds,
        contractAddress: result.data.body.contractAddress,
        transactions: result.data.transactions,
        chain: component.drop.chain
      }
    };
    const spyNfts = spyOn(component, 'getNftsForWallet');

    component.buildResults(result);

    expect(component.lastMintResults).toEqual(result);
    expect(bsModalServiceMock.show).toHaveBeenCalledWith(MintPopUpComponent, config);
    expect(spyNfts).toHaveBeenCalled();
  });

  describe('GetNftsForWallet', () => {
    it('should respond with all nfts for a specific contract address', () => {
      const data = {
        data: [mockedvenlyWalletNft]
      };
      productServiceMock.listingNFT.and.returnValue(of(data));
      walletServiceMock.getConnectedWallet.and.returnValue('Test Wallet');
      nftUtilsServiceMock.buildNftCardFromVenlyWalletNft.and.returnValue(mockedNftCard);

      component.getNftsForWallet(mockedvenlyWalletNft.contract.address);

      expect(component.contractNftsForUser).toEqual([mockedNftCard]);
      expect(walletServiceMock.getConnectedWallet).toHaveBeenCalled();
    });

    it('should respond with no nfts if there is not data received', () => {
      const data = { data: null };
      productServiceMock.listingNFT.and.returnValue(of(data));
      walletServiceMock.getConnectedWallet.and.returnValue('Test Wallet');

      component.getNftsForWallet(mockedvenlyWalletNft.contract.address);

      expect(component.contractNftsForUser).toEqual([]);
      expect(walletServiceMock.getConnectedWallet).toHaveBeenCalled();
    });

    it('should respond with an alert when fails to fetch Nfts', () => {
      productServiceMock.listingNFT.and.returnValue(throwError('Some Error'));
      const expectedError = 'something went wrong while fetching NFTs for user and contract.Some Error';
      spyOn(window, 'alert');

      component.getNftsForWallet(mockedvenlyWalletNft.contract.address);

      expect(window.alert).toHaveBeenCalledOnceWith(expectedError);
    });
  });

  describe('CheckAddressInWhitelist', () => {
    it('should return true', async () => {
      const whitelistResult = {
        whitelist: ['Test1', 'Test2', 'Test3']
      };
      walletServiceMock.getConnectedWallet.and.returnValue('Test2');
      dropServiceMock.fetchWhitelist.and.returnValue(of(whitelistResult));

      const response = await component.checkAddressInWhitelist();

      expect(response).toBe(true);
    });

    it('should return false', async () => {
      const whitelistResult = {
        whitelist: ['Test1', 'Test2', 'Test3']
      };
      walletServiceMock.getConnectedWallet.and.returnValue('Test4');
      dropServiceMock.fetchWhitelist.and.returnValue(of(whitelistResult));

      const response = await component.checkAddressInWhitelist();

      expect(response).toBe(false);
    });

    it('should return false and log an error if fetching white List fails ', async () => {
      const expectedResponse = {
        error: 'Some Error'
      };

      dropServiceMock.fetchWhitelist.and.returnValue(throwError(expectedResponse));

      const response = await component.checkAddressInWhitelist();

      expect(response).toEqual(false);
    });
  });

  describe('FetchGasOraclePricePerUnit', () => {
    it('should resolve gasoracle promise and respond with an object', async () => {
      component.gasOracle = mockedGasOracle;

      const response = await component.fetchGasOraclePricePerUnit();

      expect(response).toEqual(mockedGasOracle);
    });

    it('should reject Promise and throw an error', async () => {
      component.gasOracle = null;

      return await expectAsync(component.fetchGasOraclePricePerUnit()).toBeRejectedWith('Failed to get gasOracle after 6 attempts');
    });
  });

  it('should change size of text area', () => {
    const event = {
      taget: {
        style: {
          height: 20
        }
      }
    };

    component.inputChangeHandler(event);

    expect(jQueryServiceMock.resizeTextarea).toHaveBeenCalledWith(event);
  });

  it('should calculate remaining amount of mints correctly', () => {
    component.drop.standardTokens = 5;
    component.drop.premiumTokens = 3;
    component.drop.mints.push(component.mint);

    const response = component.calculateRemainingMints();

    expect(response).toEqual(7);
  });

  xit('should navigate to white url', () => {
    spyOn(window, 'open');
    component.drop.whitelistUrl = 'testUrl';

    component.navigateToWhitelist();

    expect(window.open).toHaveBeenCalledWith('testUrl', '_blank');
  });

  describe('IsMintDisabled', () => {
    it('should return true', () => {
      spyOn(component, 'isWhitelistRestrictionEnforced').and.returnValue(true);
      spyOn(component, 'hasDateTimeElapsed').and.returnValue(true);
      component.mint.disabled = true;

      const response = component.isMintDisabled();

      expect(response).toBe(true);
    });

    it('should return false', () => {
      spyOn(component, 'isWhitelistRestrictionEnforced').and.returnValue(true);
      spyOn(component, 'hasDateTimeElapsed').and.returnValue(true);
      component.mint.disabled = false;
      component.proposedGasFeeForSingleMint = 1.23;
      component.mint.alreadyMinted = false;
      component.isWhitelisted = true;
      component.mint.remaining = 1;
      component.agreeToTermsOfService = true;
      component.agreeToPayMintFees = true;

      const response = component.isMintDisabled();

      expect(response).toBe(false);
    });
  });

  describe('IsEligibleToMint', () => {
    it('should return true', () => {
      spyOn(component, 'isWhitelistRestrictionEnforced').and.returnValue(false);

      const response = component.isEligibleToMint();

      expect(response).toBe(true);
    });

    it('should return false', () => {
      spyOn(component, 'isWhitelistRestrictionEnforced').and.returnValue(true);
      component.isWhitelisted = false;

      const response = component.isEligibleToMint();

      expect(response).toBe(false);
    });
  });

  describe('HasDateTimeElapsed', () => {
    it('should return true', () => {
      const response = component.hasDateTimeElapsed('2022-02-02');

      expect(response).toEqual(true);
    });

    it('should return true', () => {
      const response = component.hasDateTimeElapsed('3030-03-02');

      expect(response).toEqual(false);
    });
  });

  describe('IsWhitelistRestrictionEnforced', () => {
    it('should return true', () => {
      component.drop.publicDateTime = '3030-03-02';

      const response = component.isWhitelistRestrictionEnforced();

      expect(response).toBe(true);
    });

    it('should return false', () => {
      component.drop.publicDateTime = '2022-02-02';

      const response = component.isWhitelistRestrictionEnforced();

      expect(response).toBe(false);
    });
  });

  it('should respond with a dialog with provided information', () => {
    (component as any).showWizardDialog(1, '100', 1);

    expect(wizardDialogServiceMock.showWizard).toHaveBeenCalledWith('Printing your Book to the Blockchain', stages, true);
  });

  it('should setup create mode', async () => {
    walletServiceMock.getChainWatcher.and.returnValue(of('12345'));
    walletServiceMock.getChainName.and.returnValue('ethereum');

    await (component as any).setupCreateMode();
    expect(component.drop.chain).toEqual('ethereum');
  });

  describe('SetupReadOnly', () => {
    it('should setup read only mode', () => {
      component.dropSubscription = null;
      dropServiceMock.fetchDrop.and.returnValue(of({ message: 'Fetched drops sucessfully!', data: [mockedNftDrop] }));
      spyOn(component, 'getNftsForWallet');
      spyOn<any>(component, 'setupDropPoller');
      spyOn<any>(component, 'setupGasPoller');
      const spyWhitelist = spyOn<any>(component, 'setupWhitelistPoller');

      (component as any).setupReadOnly('TestPath');

      expect(spyWhitelist).toHaveBeenCalled();
    });

    it('should respond with an error and do not not kill if id format is invalid', () => {
      route.snapshot.params.id = 's-12-34sjjmuyw';

      (component as any).setupReadOnly('TestPath');

      expect(component.kill).toBe(false);
    });
  });

  it('should setup drop poller', () => {
    dropServiceMock.pollDrops.and.returnValue(of({ message: 'Successfully get the drops!', data: [mockedNftDrop] }));
    component._id = Number(mockedNftDrop._id);
    const spyMints = spyOn<any>(component, 'checkMints');
    (component as any).setupDropPoller();

    expect(spyMints).toHaveBeenCalled();
    expect(component.drop.mints).toEqual(mockedNftDrop.mints);
  });

  it('should setup gas poller', () => {
    dropServiceMock.pollGasOracle.and.returnValue(of({ data: { result: {} } }));
    const spyGas = spyOn<any>(component, 'calculateEtherGasFeeForSingleMint');

    (component as any).setupGasPoller();

    expect(spyGas).toHaveBeenCalled();
  });

  describe('CheckMints', () => {
    it('should set mint to true if it is already minted', () => {
      spyOn(component, 'hasDateTimeElapsed').and.returnValue(false);
      walletServiceMock.getConnectedWallet.and.returnValue(mockedMintItem.recipient);
      component.drop.mints.push(mockedMintItem);

      (component as any).checkMints();

      expect(component.mint.alreadyMinted).toBe(true);
    });

    it('should set mint to false if it is not already minted', () => {
      spyOn(component, 'hasDateTimeElapsed').and.returnValue(false);
      walletServiceMock.getConnectedWallet.and.returnValue(null);

      (component as any).checkMints();

      expect(component.mint.alreadyMinted).toBe(false);
    });

    it('should set false return if time has elapsed the deadline', () => {
      spyOn(component, 'hasDateTimeElapsed').and.returnValue(true);

      (component as any).checkMints();

      expect(component.mint.alreadyMinted).toBe(false);
    });
  });

  describe('setupWhitelistPoller', () => {
    it('should return if kill is true in first call', () => {
      component.kill = true;

      (component as any).setupWhitelistPoller();

      expect(component.isWhitelisted).toBe(false);
    });

    it('should return after checking address', () => {
      component.kill = false;

      spyOn(component, 'checkAddressInWhitelist').and.callFake(() => {
        component.kill = true;
        return new Promise((res) => {
          res(false);
        });
      });

      (component as any).setupWhitelistPoller();

      expect(component.isWhitelisted).toBe(false);
    });

    it('should return after first call of the function', fakeAsync(() => {
      component.kill = false;
      spyOn(component, 'checkAddressInWhitelist').and.callFake(() => {
        component.kill = false;
        setTimeout(() => {
          component.kill = true;
        }, 11000);
        return new Promise((res) => {
          res(true);
        });
      });

      (component as any).setupWhitelistPoller();
      flush();

      expect(component.isWhitelisted).toBe(true);
    }));
  });
});
