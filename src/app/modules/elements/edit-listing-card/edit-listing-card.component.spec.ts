import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ProductService } from 'app/core/product/product.service';
import { EditListingCardComponent } from './edit-listing-card.component';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { VenlyService } from 'app/core/venly/venly.service';
import { ErrorsService } from 'app/core/errors/errors.service';
import { MatDialog } from '@angular/material/dialog';
import { Router } from '@angular/router';
import { CartService } from 'app/core/cart/cart.service';
import { NftUtilsService } from 'app/shared/nft-utils.service';
import { mockedNft, mockedOfferResponse } from 'app/core/auction/spec-files/mocked';
import { mockedCartItem, mockedSaleNFt } from 'app/modules/landing/cart/spec-files/mocked';
import { of, throwError } from 'rxjs';
import { offercreatedModelMocked } from 'app/core/venly/spec-files/mocked';
import { WizardDialogService } from 'app/shared/wizard-dialog-service/wizard-dialog.service';

describe('EditListingCardComponent', () => {
  let component: EditListingCardComponent;
  let fixture: ComponentFixture<EditListingCardComponent>;
  const matDialogMock = jasmine.createSpyObj('MatDialog', ['close', 'closeAll']);
  const productServiceMock = jasmine.createSpyObj('ProductService', ['createForSale', 'cancelListing', 'editListing']);
  const venlyServiceMock = jasmine.createSpyObj('VenlyService', ['updateOfferWithApproval', 'updateOfferWithSignature']);
  const cartServiceMock = jasmine.createSpyObj('CartService', ['addItemToCart']);
  const nftServiceMock = jasmine.createSpyObj('NftUtilsService', ['getFallbackImage']);
  const wizardServiceMock = jasmine.createSpyObj('WizardDialogService', ['advanceStages', 'showWizard', 'setError']);
  const errorsServiceMock = jasmine.createSpyObj('ErrorsService', ['openSnackBar']);
  const routerMock = jasmine.createSpyObj('Router', ['navigateByUrl']);

  nftServiceMock.getFallbackImage.and.returnValue('some image');

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [EditListingCardComponent],
      imports: [HttpClientTestingModule],
      providers: [
        { provide: ProductService, useValue: productServiceMock },
        { provide: MatDialog, useValue: matDialogMock },
        { provide: ErrorsService, useValue: errorsServiceMock },
        { provide: Router, useValue: routerMock },
        { provide: VenlyService, useValue: venlyServiceMock },
        { provide: CartService, useValue: cartServiceMock },
        { provide: NftUtilsService, useValue: nftServiceMock },
        { provide: WizardDialogService, useValue: wizardServiceMock }
      ]
    }).compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(EditListingCardComponent);
    component = fixture.componentInstance;
    component.nft = { nft: {}, type: 'abc' };
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should replace image with fallback image', () => {
    component.imageError(mockedNft);

    expect(mockedNft.imageUrl).toEqual('some image');
  });

  it('should add an item to the cart', () => {
    const expectedResponse = mockedCartItem;
    expectedResponse.count = 1;
    expectedResponse.subTotal = expectedResponse.price;

    component.addToCart(mockedSaleNFt);

    expect(cartServiceMock.addItemToCart).toHaveBeenCalledWith(expectedResponse);
  });

  describe('listForSale', () => {
    it('should approve transaction and list a nft for sale', () => {
      const data = { ...mockedNft, metadata: { contract: mockedNft.contract }, type: mockedNft.contract.type };
      spyOn<any>(component, 'showWizardDialog');
      productServiceMock.createForSale.and.returnValue(of({ data: offercreatedModelMocked }));
      venlyServiceMock.updateOfferWithApproval.and.resolveTo({});
      venlyServiceMock.updateOfferWithSignature.and.resolveTo({});
      component.nft = {
        contract: {
          address: '0x029384'
        }
      };

      component.listForSale(data);

      expect(wizardServiceMock.advanceStages).toHaveBeenCalled();
      expect(venlyServiceMock.updateOfferWithApproval).toHaveBeenCalledWith('0x029384', offercreatedModelMocked);
    });

    it('should list a nft for sale with already approved transaction', () => {
      const data = { ...mockedNft, metadata: { contract: mockedNft.contract }, type: mockedNft.contract.type };
      const mockedOfferModel = { ...offercreatedModelMocked };
      mockedOfferModel.transaction = [];
      spyOn<any>(component, 'showWizardDialog');
      productServiceMock.createForSale.and.returnValue(of({ data: mockedOfferModel }));
      venlyServiceMock.updateOfferWithSignature.and.resolveTo({});

      component.listForSale(data);

      expect(wizardServiceMock.advanceStages).toHaveBeenCalled();
      expect(component.activeNft).toEqual('');
    });

    it('should respond with an error if nft for sale is not created correctly', () => {
      const data = { ...mockedNft, metadata: { contract: mockedNft.contract }, type: mockedNft.contract.type };
      productServiceMock.createForSale.and.returnValue(throwError('Failed to create nft for sale!'));

      component.listForSale(data);

      expect(wizardServiceMock.setError).toHaveBeenCalledWith('Failed to create nft for sale!');
      expect(errorsServiceMock.openSnackBar).toHaveBeenCalledWith('Something went wrong!', 'Error');
    });
  });

  describe('cancelListing', () => {
    it('should cancel a listing and navigate back to market', () => {
      component.offer = mockedOfferResponse;
      productServiceMock.cancelListing.and.returnValue(of(mockedOfferResponse.nft));

      component.cancelListing();

      expect(errorsServiceMock.openSnackBar).toHaveBeenCalledWith('Listing Cancelled Succesfully', 'Success');
      expect(routerMock.navigateByUrl).toHaveBeenCalledWith('/market');
    });

    it('should respond with an error if listing is not cancelled correctly', () => {
      component.offer = mockedOfferResponse;
      productServiceMock.cancelListing.and.returnValue(throwError('failed to cancel listing'));

      component.cancelListing();

      expect(errorsServiceMock.openSnackBar).toHaveBeenCalledWith('Failed to cancel listing', 'Error');
    });
  });

  describe('editListing', () => {
    it('should return if offer price is less than 0.5', () => {
      component.offer = { ...mockedOfferResponse };
      component.offer.price = 0.2;

      component.editListing();

      expect(errorsServiceMock.openSnackBar).toHaveBeenCalledWith('Minimum listing price is 0.5', 'Error');
      expect(component.offer.price).toEqual(0.5);
    });

    it('should edit a listing sucessfully and navigate back to market', () => {
      component.offer = mockedOfferResponse;
      productServiceMock.editListing.and.returnValue(of(mockedOfferResponse.nft));

      component.editListing();

      expect(errorsServiceMock.openSnackBar).toHaveBeenCalledWith('Listing Edited Succesfully', 'Success');
      expect(routerMock.navigateByUrl).toHaveBeenCalledWith('/market');
    });

    it('should respond with an error if edit listing fails', () => {
      productServiceMock.editListing.and.returnValue(throwError('failed to edit listing'));

      component.editListing();

      expect(errorsServiceMock.openSnackBar).toHaveBeenCalledWith('Failed to edit listing', 'Error');
    });
  });

  it('should return the timer value', () => {
    const response = component.timer(new Date().getTime());

    expect(response).toBeTruthy();
  });
});
