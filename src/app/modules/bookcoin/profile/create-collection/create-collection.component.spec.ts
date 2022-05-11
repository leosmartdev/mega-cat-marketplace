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
import { BsModalRef, BsModalService, ModalOptions } from 'ngx-bootstrap/modal';
import { WalletService } from 'app/core/wallet/wallet.service';
import { VenlyCollectionResponseModel } from 'app/core/models/venly-collection-response.model';
import { CollectionCreatedPopupComponent } from 'app/modules/elements/collection-created-popup/collection-created-popup.component';
import { WizardDialogService } from 'app/shared/wizard-dialog-service/wizard-dialog.service';
import Swal from 'sweetalert2';
import { RewardsService } from 'app/core/rewards/rewards.service';

describe('CreateCollectionComponent', () => {
  let component: CreateCollectionComponent;
  let fixture: ComponentFixture<CreateCollectionComponent>;
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
  const authServiceMock = jasmine.createSpyObj('AuthService', ['check', 'isAdmin']);
  const walletServiceMock = jasmine.createSpyObj('walletService', ['currentAccount', 'requireChain']);
  const productServiceMock = jasmine.createSpyObj('ProductService', ['createCollection']);
  const errorServiceMock = jasmine.createSpyObj('ErrorsService', ['openSnackBar']);
  const bsModalServiceMock = jasmine.createSpyObj('BsModalService', ['show']);
  const bsModalRefMock = jasmine.createSpyObj('BsModalRef', ['']);
  const wizardServiceMock = jasmine.createSpyObj('WizardDialogService', ['advanceStages', 'showWizard', 'setError', 'failStage']);
  const rewardsServiceMock = jasmine.createSpyObj('RewardsService', ['listRewards', 'createReward', 'listUserRewards', 'listUnassignedRewards']);
  rewardsServiceMock.listRewards.and.returnValue(of([]));
  rewardsServiceMock.listUnassignedRewards.and.returnValue(of([]));
  authServiceMock.check.and.returnValue(of(true));
  authServiceMock.isAdmin.and.returnValue(of(false));
  walletServiceMock.requireChain.and.resolveTo(true);

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [CreateCollectionComponent],
      imports: [HttpClientTestingModule, RouterTestingModule],
      providers: [
        { provide: AuthService, useValue: authServiceMock },
        { provide: BsModalService, useValue: bsModalServiceMock },

        {
          provide: ActivatedRoute,
          useValue: {
            params: of({ id: 123 })
          }
        },
        { provide: WalletService, useValue: walletServiceMock },
        { provide: FormBuilder },
        { provide: ProductService, useValue: productServiceMock },
        { provide: ErrorsService, useValue: errorServiceMock },
        { provide: BsModalRef, useValue: bsModalRefMock },
        { provide: WizardDialogService, useValue: wizardServiceMock },
        { provide: RewardsService, useValue: rewardsServiceMock }
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
      component.createCollectionForm.controls['subheading'].setValue('test subheading');
      component.createCollectionForm.controls['about'].setValue('test about info');
      component.createCollectionForm.controls['royalty'].setValue('test royalty');
      component.createCollectionForm.controls['story'].setValue('test story');
      component.createCollectionForm.controls['perks'].setValue('test perk');

      component.createCollectionForm.controls['description'].setValue('test description');
      component.createCollectionForm.controls['symbol'].setValue('test symbol');
      component.createCollectionForm.controls['images'].setValue(['test1.png', 'test2.png']);
    });

    it('should create a collection successfully', fakeAsync(() => {
      walletServiceMock.requireChain.and.returnValue({ status: true });
      spyOnProperty(component.createCollectionForm, 'invalid').and.returnValue(false);
      spyOn<any>(component, 'showCollectionModal');
      const expectedResponse = { collection: mockedVenlyCollection };
      walletServiceMock.currentAccount = 'test address';
      productServiceMock.createCollection.and.returnValue(of(expectedResponse));

      component.createCollection();
      flush();

      expect(errorServiceMock.openSnackBar).toHaveBeenCalledWith('Collection created successfully!', 'Success');
    }));

    it('should return if form is invalid', () => {
      component.createCollectionForm.controls['name'].setValue(null);

      component.createCollection();

      expect(component.createCollectionForm.invalid).toBe(true);
    });

    it('should respond with a snackbar error and enable the form', fakeAsync(() => {
      walletServiceMock.requireChain.and.returnValue({ status: true });
      const spyEnable = spyOn(component.createCollectionForm, 'enable');
      spyOnProperty(component.createCollectionForm, 'invalid').and.returnValue(false);
      walletServiceMock.currentAccount = 'test address';
      productServiceMock.createCollection.and.returnValue(throwError({ error: 'error creating collection' }));

      component.createCollection();
      flush();

      expect(errorServiceMock.openSnackBar).toHaveBeenCalledWith('Something went wrong!', 'Error');
      expect(spyEnable).toHaveBeenCalledTimes(1);
    }));

    it('should respond with an alert if user denies to switch network', fakeAsync(() => {
      const alert = {
        icon: 'info',
        title: "<p class='text-white'>Please switch MetaMask to mumbai network to proceed!</p>",
        background: '#5b5353',
        iconColor: 'white'
      };
      walletServiceMock.requireChain.and.returnValue({ status: false });
      spyOn(Swal, 'fire');
      spyOnProperty(component.createCollectionForm, 'invalid').and.returnValue(false);

      component.createCollection();
      flush();

      expect(Swal.fire).toHaveBeenCalledWith(alert as any);
    }));
  });

  it('should show collection modal', () => {
    const expectedConfig: ModalOptions = {
      class: 'collection-created-container',
      initialState: {
        collection: mockedVenlyCollection
      }
    };

    bsModalServiceMock.show.and.returnValue(bsModalRefMock);

    (component as any).showCollectionModal(mockedVenlyCollection);

    expect(bsModalServiceMock.show).toHaveBeenCalledWith(CollectionCreatedPopupComponent, expectedConfig);
  });
});
