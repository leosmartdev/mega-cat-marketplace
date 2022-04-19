import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ProfileComponent } from './profile.component';
import { AuthService } from 'app/core/auth/auth.service';
import { ProductService } from 'app/core/product/product.service';
import { ErrorsService } from 'app/core/errors/errors.service';
import { FormBuilder } from '@angular/forms';
import { VenlyService } from 'app/core/venly/venly.service';
import { SharedService } from 'app/core/shared/shared.service';
import { Router } from '@angular/router';
import { MatDialog } from '@angular/material/dialog';
import { of, throwError } from 'rxjs';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { mockedNftCard, mockedOfferResponse, mockedvenlyWalletNft, mockUser } from 'app/core/auction/spec-files/mocked';
import { WalletService } from 'app/core/wallet/wallet.service';
import { NftCardModel } from 'app/core/models/nft-card.model';
import { NftUtilsService } from 'app/shared/nft-utils.service';

describe('ProfileComponent', () => {
  let component: ProfileComponent;
  let fixture: ComponentFixture<ProfileComponent>;
  const authServiceMock = jasmine.createSpyObj('AuthService', ['updateAvatar', 'isAdmin', 'updateWalletAddresses', 'updateLinkedWalletAddresses']);
  authServiceMock.updateAvatar.and.returnValue(of(null));
  authServiceMock.isAdmin.and.returnValue(of(true));
  const matDialogMock = jasmine.createSpyObj('MatDialog', ['close', 'closeAll']);
  const productServiceMock = jasmine.createSpyObj('ProductService', ['getAllListings', 'listingNFTByLinkedWallets', 'listingNFTByWallet']);
  const walletServiceMock = jasmine.createSpyObj('WalletService', ['user', 'getAccounts']);
  const nftServiceMock = jasmine.createSpyObj('NftUtilsService', ['buildNftCardFromVenlyWalletNft', 'buildNftCardFromVenlyOffer']);
  const errorServiceMock = jasmine.createSpyObj('ErrorsService', ['openSnackBar']);

  walletServiceMock.user = 'someone';
  walletServiceMock.getAccounts.and.returnValue(of([]));

  const mockedOffer = JSON.parse(JSON.stringify(mockedOfferResponse));
  mockedOffer.status = 'AWAITING_FINALIZING_OFFER';
  productServiceMock.getAllListings.and.returnValue(of({ data: [mockedOffer] }));
  nftServiceMock.buildNftCardFromVenlyWalletNft.and.returnValue(mockedNftCard);
  productServiceMock.listingNFTByLinkedWallets.and.returnValue(of({ data: [mockedvenlyWalletNft] }));

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ProfileComponent],
      imports: [HttpClientTestingModule],
      providers: [
        { provide: AuthService, useValue: authServiceMock },
        { provide: Router, useValue: jasmine.createSpy('routerMock') },
        { provide: WalletService, useValue: walletServiceMock },
        { provide: ProductService, useValue: productServiceMock },
        { provide: VenlyService },
        { provide: ErrorsService, useValue: {} },
        { provide: MatDialog, useValue: matDialogMock },
        { provide: SharedService },
        { provide: ErrorsService, useValue: errorServiceMock },
        { provide: FormBuilder },
        { provide: NftUtilsService, useValue: nftServiceMock }
      ]
    }).compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(ProfileComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
    component.nfts = [];
  });

  afterEach(() => {
    fixture.destroy();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  describe('GetPendingOffers', () => {
    it('should get all pending listings successfully', () => {
      component.nfts = [];
      productServiceMock.getAllListings.and.returnValue(of({ data: [mockedOffer] }));
      nftServiceMock.buildNftCardFromVenlyOffer.and.returnValue(mockedNftCard as NftCardModel);
      const user = JSON.parse(JSON.stringify(mockUser));
      user.id = mockedOffer.externalBuyerId;
      component.walletAddress = mockedOffer.buyerWalletAddress;

      component.getPendingOffers();

      expect(component.nfts).toEqual([{ nft: mockedNftCard }]);
    });

    it('should log an error and do not set nfts if request to get pending offers fails', () => {
      productServiceMock.getAllListings.and.returnValue(throwError('failed to get pending offers'));

      component.getPendingOffers();

      expect(component.nfts).toEqual([]);
    });
  });

  describe('getNftsForWallet', () => {
    it('should get all offers owned by user', () => {
      component.nfts = [{ nft: mockedNftCard }];
      component.filteredNFTs = [];
      component.linkedWalletAddresses = [];
      component.walletAddress = mockedOffer.sellerAddress;

      productServiceMock.getAllListings.and.returnValue(of({ data: [mockedOffer] }));
      productServiceMock.listingNFTByWallet.and.returnValue(of({ data: [mockedvenlyWalletNft] }));
      nftServiceMock.buildNftCardFromVenlyOffer.and.returnValue(mockedNftCard as NftCardModel);
      component.collectionsNFTs.set(mockedNftCard.contract.address, [mockedNftCard]);

      component.getNFTsForWallet();

      expect(component.filteredNFTs).toEqual([{ nft: mockedNftCard }, { nft: mockedNftCard }]);
    });

    it('should store an empty array if no data is received', () => {
      component.nfts = [];
      component.filteredNFTs = [];
      component.linkedWalletAddresses = [];
      component.walletAddress = mockedOffer.sellerAddress;
      productServiceMock.getAllListings.and.returnValue(of({ data: [mockedOffer] }));
      component.walletAddress = mockedOffer.sellerAddress;
      productServiceMock.listingNFTByWallet.and.returnValue(of({ data: undefined }));

      component.getNFTsForWallet();

      expect(component.filteredNFTs).toEqual([]);
      expect(component.nfts).toEqual([]);
    });

    it('should get the nfts for selected wallet filter', () => {
      component.filteredNFTs = [];
      component.linkedWalletAddresses = ['testAddress'];
      component.walletAddressFilter = { walletAddress: 'testAddress' };
      productServiceMock.getAllListings.and.returnValue(of({ data: [mockedOffer] }));
      component.walletAddress = mockedOffer.sellerAddress;
      productServiceMock.listingNFTByWallet.and.returnValue(of({ data: [mockedvenlyWalletNft] }));
      nftServiceMock.buildNftCardFromVenlyOffer.and.returnValue(mockedNftCard as NftCardModel);

      component.getNFTsForWallet();

      expect(component.filteredNFTs).toEqual([{ nft: mockedNftCard }, { nft: mockedNftCard }]);
      expect(productServiceMock.listingNFTByWallet).toHaveBeenCalledWith('testAddress');
    });

    it('should respond with a snackbar if failed to fetch listings', () => {
      productServiceMock.getAllListings.and.returnValue(of({ data: [mockedOffer] }));
      component.walletAddress = 'someotheraddress';
      productServiceMock.listingNFTByWallet.and.returnValue(
        throwError({
          message: 'hi'
        })
      );
      productServiceMock.listingNFTByLinkedWallets.and.returnValue(
        throwError({
          message: 'hi'
        })
      );

      component.getNFTsForWallet();

      expect(errorServiceMock.openSnackBar).toHaveBeenCalledWith('Something went wrong!', 'Error: hi');
    });
  });

  describe('setWalletAddress', () => {
    it('should set the wallet address to null if no account is received', () => {
      walletServiceMock.getAccounts.and.returnValue(of([]));

      component.setWalletAddress();

      expect(component.walletAddress).toEqual(null);
    });

    it('should set the wallet address to the first account address', () => {
      walletServiceMock.getAccounts.and.returnValue(of(['test address']));

      component.setWalletAddress();

      expect(component.walletAddress).toEqual('test address');
    });
  });

  it('should set users avatar successfully', () => {
    component.user = mockUser;

    component.setAvatar();

    expect(component.avatar).toEqual(mockUser.avatar);
  });

  it('should set users banner successfully', () => {
    component.user = mockUser;

    component.setBanner();

    expect(component.banner).toEqual(mockUser.banner);
  });

  it('should update avatar to the provided image', () => {
    const event = { target: { files: [new Blob(['test1.png', 'test2.png', 'test3.png'])], result: 'Test Result' } };
    component.user = JSON.parse(JSON.stringify(mockUser));
    component.user.avatar = 'test1.png';

    component.onChangeAvatar(event);

    expect(component.avatar).toEqual('test1.png');
  });

  it('should successfully get user', () => {
    authServiceMock.user = mockUser;

    const response = component.getUser();

    expect(response).toEqual(mockUser);
  });

  it('should change tab', () => {
    component.changeTab(3);

    expect(component.selectedTab).toEqual(3);
  });

  describe('OpenPanel', () => {
    it('should set active panel to provided panel name', () => {
      component.activePanel = 'Some Panel';

      component.openPanel('Test Panel');

      expect(component.activePanel).toEqual('Test Panel');
    });

    it('should set active panel to nil', () => {
      component.activePanel = 'Test Panel';

      component.openPanel('Test Panel');

      expect(component.activePanel).toEqual('');
    });
  });
});
