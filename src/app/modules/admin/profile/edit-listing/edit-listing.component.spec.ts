import { ComponentFixture, TestBed } from '@angular/core/testing';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { AngularFireAuthModule } from '@angular/fire/compat/auth';
import { AngularFireModule } from '@angular/fire/compat';
import { environment } from 'environments/environment';
import { RouterTestingModule } from '@angular/router/testing';
import { ErrorsService } from '../../../../core/errors/errors.service';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { ReactiveFormsModule } from '@angular/forms';
import { EditListingComponent } from './edit-listing.component';
import { ProductService } from 'app/core/product/product.service';
import { mockedOfferResponse, mockUser } from 'app/core/auction/spec-files/mocked';
import { WalletService } from 'app/core/wallet/wallet.service';
import { of, throwError } from 'rxjs';
import { AuthService } from 'app/core/auth/auth.service';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';

describe('EditListingComponent', () => {
  let component: EditListingComponent;
  let fixture: ComponentFixture<EditListingComponent>;

  const walletServiceMock = jasmine.createSpyObj('WalletService', ['getAccounts']);
  const productServiceMock = jasmine.createSpyObj('ProductService', ['getAllListings']);
  productServiceMock.getAllListings.and.returnValue(of({ data: [] }));
  walletServiceMock.getAccounts.and.returnValue(of([]));

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [EditListingComponent],
      imports: [
        HttpClientTestingModule,
        AngularFireModule.initializeApp(environment.firebase),
        AngularFireAuthModule,
        RouterTestingModule,
        MatSnackBarModule,
        ReactiveFormsModule,
        BrowserAnimationsModule
      ],
      providers: [
        ErrorsService,
        MatSnackBar,
        { provide: ProductService, useValue: productServiceMock },
        { provide: AuthService },
        { provide: WalletService, useValue: walletServiceMock }
      ]
    }).compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(EditListingComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  afterEach(() => {
    fixture.destroy();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should set avatar to users avatar', () => {
    component.user = mockUser;
    component.setAvatar();
    expect(component.avatar).toEqual(mockUser.avatar);
  });

  describe('setWalletAddress', () => {
    it('should set the wallet address correctly and get listings', () => {
      const mockedOffer = mockedOfferResponse;
      mockedOffer.status = 'READY';
      productServiceMock.getAllListings.and.returnValue(of({ data: [mockedOffer] }));
      walletServiceMock.getAccounts.and.returnValue(of(['xyz']));

      component.setWalletAddress();

      expect(component.nfts).toEqual([mockedOffer]);
    });

    it('should show an error if it fails to get listings', () => {
      productServiceMock.getAllListings.and.returnValue(throwError('Failed to get listings'));
      walletServiceMock.getAccounts.and.returnValue(of(['xyz']));
      const spySnackBar = spyOn<any>((component as any).errorsService, 'openSnackBar');

      component.setWalletAddress();

      expect(spySnackBar).toHaveBeenCalledWith('Something went wrong!', 'Error');
    });

    it('should return if there is no listing in listings response', () => {
      component.nfts = [];
      productServiceMock.getAllListings.and.returnValue(of(undefined));
      walletServiceMock.getAccounts.and.returnValue(of(['xyz']));

      component.setWalletAddress();

      expect(component.nfts).toEqual([]);
    });
  });

  it('should search the nfts correctly', () => {
    const expectedResonse = [{ ...mockedOfferResponse, metadata: { name: 'test' } }];
    component.nfts = expectedResonse;
    component.term = 'test';

    component.search();

    expect(component.filteredNFTs).toEqual(expectedResonse);
  });

  it('should log an offer', () => {
    spyOn(console, 'log');

    component.openNft(mockedOfferResponse);

    expect(console.log).toHaveBeenCalledWith(mockedOfferResponse);
  });

  it('should load set the state of loader to true', () => {
    component.loader(true);

    expect(component.loading).toEqual(true);
  });
});
