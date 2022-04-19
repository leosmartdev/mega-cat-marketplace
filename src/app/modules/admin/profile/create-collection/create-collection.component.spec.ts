import { ComponentFixture, fakeAsync, flush, TestBed } from '@angular/core/testing';
import { AuthService } from 'app/core/auth/auth.service';
import { ProductService } from 'app/core/product/product.service';
import { CreateCollectionComponent } from './create-collection.component';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { RouterTestingModule } from '@angular/router/testing';
import { FormBuilder } from '@angular/forms';
import { of, throwError } from 'rxjs';
import { ErrorsService } from '../../../../core/errors/errors.service';
import { ActivatedRoute, Router } from '@angular/router';
import { BsModalRef, BsModalService } from 'ngx-bootstrap/modal';
import { WalletService } from 'app/core/wallet/wallet.service';
import { VenlyCollectionResponseModel } from 'app/core/models/venly-collection-response.model';
import { WizardDialogService } from 'app/shared/wizard-dialog-service/wizard-dialog.service';
import { MatInputModule } from '@angular/material/input';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';

describe('CreateCollectionComponent', () => {
  let component: CreateCollectionComponent;
  let fixture: ComponentFixture<CreateCollectionComponent>;
  const authServiceMock = jasmine.createSpyObj('AuthService', ['check', 'updateWalletAddresses', 'updateLinkedWalletAddresses']);
  const walletServiceMock = jasmine.createSpyObj('walletService', [''], ['currentAccount']);
  const errorServiceMock = jasmine.createSpyObj('ErrorsService', ['openSnackBar']);
  const productServiceMock = jasmine.createSpyObj('ProductService', ['createCollection']);
  const bsModalServiceMock = jasmine.createSpyObj('BsModalService', ['show']);
  const wizardDialogMock = jasmine.createSpyObj('WizardDialogService', ['showWizard', 'advanceStages', 'failStage']);
  const bsModalRefMock = jasmine.createSpyObj('BsModalRef', ['']);

  const mockedVenlyCollection: VenlyCollectionResponseModel = {
    name: 'test',
    description: 'Some description',
    confirmed: true,
    id: 123,
    secretType: 'test type',
    symbol: 'test symbol',
    externalUrl: 'test yrl',
    image: 'test.png',
    media: [],
    transactionHash: 'test hash',
    external_link: 'test link'
  };

  authServiceMock.check.and.returnValue(of(true));

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [CreateCollectionComponent],
      imports: [HttpClientTestingModule, RouterTestingModule, MatInputModule, BrowserAnimationsModule],
      providers: [
        { provide: AuthService, useValue: authServiceMock },
        { provide: BsModalService, useValue: bsModalServiceMock },
        {
          provide: ActivatedRoute,
          useValue: {
            params: of({ id: 123 })
          }
        },
        { provide: FormBuilder },
        { provide: ProductService, useValue: productServiceMock },
        { provide: ErrorsService, useValue: errorServiceMock },
        { provide: WalletService, useValue: walletServiceMock },
        { provide: WizardDialogService, useValue: wizardDialogMock },
        { provide: BsModalRef, useValue: bsModalRefMock }
      ]
    }).compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(CreateCollectionComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  describe('createCollection', () => {
    beforeEach(() => {
      component.createCollectionForm.controls['name'].setValue('test');
      component.createCollectionForm.controls['description'].setValue('test description');
      component.createCollectionForm.controls['symbol'].setValue('test symbol');
      component.createCollectionForm.controls['images'].setValue(['test1.png', 'test2.png']);
    });
    it('should return if form is invalid', () => {
      const spyInvalid = spyOnProperty(component.createCollectionForm, 'invalid').and.returnValue(true);

      component.createCollection();

      expect(spyInvalid).toHaveBeenCalledTimes(1);
    });

    it('should create a collection sucessfully', fakeAsync(() => {
      spyOnProperty(component.createCollectionForm, 'invalid').and.returnValue(false);
      spyOn<any>(component, 'showCollectionModal');
      const expectedResonse = { collection: mockedVenlyCollection };
      walletServiceMock.currentAccount = { walletAddress: 'test address' };
      productServiceMock.createCollection.and.returnValue(of(expectedResonse));

      component.createCollection();
      flush();

      expect(errorServiceMock.openSnackBar).toHaveBeenCalledWith('Product created successfully!', 'Success');
    }));

    it('should respond with a snackbar error and enable the form', () => {
      const spyEnable = spyOn(component.createCollectionForm, 'enable');
      spyOnProperty(component.createCollectionForm, 'invalid').and.returnValue(false);
      walletServiceMock.currentAccount = { walletAddress: 'test address' };
      productServiceMock.createCollection.and.returnValue(throwError({ error: 'error creating collection' }));

      component.createCollection();

      expect(errorServiceMock.openSnackBar).toHaveBeenCalledWith('Something went wrong!', 'Error');
      expect(spyEnable).toHaveBeenCalledTimes(1);
    });

    it('should just enable the form if loading snackbar fails', () => {
      errorServiceMock.openSnackBar.and.returnValue(throwError({ error: 'Failed to open Snack Bar' }));
      const spyEnable = spyOn(component.createCollectionForm, 'enable');
      spyOnProperty(component.createCollectionForm, 'invalid').and.returnValue(false);
      walletServiceMock.currentAccount = { walletAddress: 'test address' };
      productServiceMock.createCollection.and.returnValue(throwError({ error: 'error creating collection' }));

      component.createCollection();

      expect(spyEnable).toHaveBeenCalledTimes(1);
    });
  });

  it('should set images source to the according to event', () => {
    const event = { target: { files: [new Blob(['test1.png', 'test2.png', 'test3.png'])], result: 'Test Result' } };
    const spySetImageSource = spyOn<any>(component, 'setImageSource').and.callThrough();

    component.onChange(event);

    expect(spySetImageSource).toHaveBeenCalledWith(event);
  });

  it('should show collection modal', () => {
    bsModalServiceMock.show.and.returnValue(bsModalRefMock);

    (component as any).showCollectionModal(mockedVenlyCollection);
  });
});
