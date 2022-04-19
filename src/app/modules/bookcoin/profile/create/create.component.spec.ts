import { ComponentFixture, fakeAsync, flush, TestBed } from '@angular/core/testing';

import { CreateComponent } from './create.component';
import { BsModalService } from 'ngx-bootstrap/modal';
import { FormBuilder, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { ErrorsService } from 'app/core/errors/errors.service';
import { ProductService } from 'app/core/product/product.service';
import { SharedService } from 'app/core/shared/shared.service';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { RouterTestingModule } from '@angular/router/testing';
import { of, throwError } from 'rxjs';
import { AngularFireAuthModule } from '@angular/fire/compat/auth';
import { AngularFireModule } from '@angular/fire/compat';
import { environment } from 'environments/environment';
import { AuthService } from 'app/core/auth/auth.service';
import { mockedVenlyNftCreated } from '../../collection/spec-files/mocked';
import { WizardDialogService } from 'app/shared/wizard-dialog-service/wizard-dialog.service';
import { WalletService } from 'app/core/wallet/wallet.service';
import Swal from 'sweetalert2';

describe('CreateComponent', () => {
  let component: CreateComponent;
  let fixture: ComponentFixture<CreateComponent>;

  const authServiceMock = jasmine.createSpyObj('AuthService', ['isAdmin']);
  authServiceMock.isAdmin.and.returnValue(of(false));
  const productServiceMock = jasmine.createSpyObj('ProductService', ['getCollections', 'createProduct']);
  const errorsServiceMock = jasmine.createSpyObj('ErrorService', ['openSnackBar']);
  const modalServiceMock = jasmine.createSpyObj('BsModalService', ['show']);
  const wizardServiceMock = jasmine.createSpyObj('WizardDialogService', ['advanceStages', 'showWizard', 'setError', 'failStage']);
  const walletServiceMock = jasmine.createSpyObj('WalletService', ['requireChain']);

  walletServiceMock.requireChain.and.resolveTo({ status: true });

  const fakeProducts = { walletAddress: '123' };
  productServiceMock.getCollections.and.returnValue(of(fakeProducts));

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [CreateComponent],
      imports: [HttpClientTestingModule, AngularFireModule.initializeApp(environment.firebase), AngularFireAuthModule, RouterTestingModule],
      providers: [
        { provide: BsModalService, useValue: modalServiceMock },
        { provide: Router, useValue: jasmine.createSpy('routerMock') },
        {
          provide: ActivatedRoute,
          useValue: {
            params: of({ id: 123 })
          }
        },
        { provide: AuthService, useValue: authServiceMock },

        { provide: FormBuilder },
        { provide: ProductService, useValue: productServiceMock },
        { provide: ErrorsService, useValue: errorsServiceMock },
        { provide: SharedService },
        { provide: WizardDialogService, useValue: wizardServiceMock },
        { provide: WalletService, useValue: walletServiceMock }
      ]
    }).compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(CreateComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
    component.thecollection = {
      story: 'test Story',
      perks: 'test perks'
    };
  });

  afterEach(() => {
    fixture.destroy();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should create without collections', () => {
    productServiceMock.getCollections.and.returnValue(throwError('something went wrong'));
    fixture.destroy();

    fixture = TestBed.createComponent(CreateComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();

    expect(component).toBeTruthy();
  });

  describe('createProduct', () => {
    beforeEach(() => {
      component.createProductForm = (component as any).formBuilder.group({
        name: ['test', Validators.required],
        description: ['test', Validators.required],
        properties: ['test', Validators.required],
        images: ['test.png', Validators.required],
        selectedCollection: ['test', Validators.required],
        supply: [1, Validators.required],
        story: ['test story', Validators.required],
        perks: ['test', Validators.required],
        faqs: ['test', Validators.required],
        tos: ['test', Validators.required]
      });
      component.collections = [{ name: 'test', collectionId: '123', _id: 'testid1547' }];
    });

    it('should return if create form is invalid', () => {
      component.createProductForm.controls['name'].setValue(null);

      component.createProduct();

      expect(component.fileError).toBe(true);
    });

    it('should create a product', fakeAsync(() => {
      const productResponse = {
        message: 'Successfully received!',
        data: [mockedVenlyNftCreated]
      };
      spyOn(Swal, 'fire');
      walletServiceMock.requireChain.and.resolveTo({ status: true });
      productServiceMock.createProduct.and.returnValue(of(productResponse));

      component.createProduct();
      flush();

      expect(errorsServiceMock.openSnackBar).toHaveBeenCalledWith('Product created successfully!', 'Success');
    }));

    it('should respond with an error when fails to create a product', fakeAsync(() => {
      spyOn(Swal, 'fire');
      productServiceMock.createProduct.and.returnValue(throwError(''));
      walletServiceMock.requireChain.and.resolveTo({ status: true });

      component.createProduct();
      flush();

      expect(errorsServiceMock.openSnackBar).toHaveBeenCalledWith('Something went wrong!', 'Error');
    }));

    it('should respond with alert when fails to switch network', fakeAsync(() => {
      spyOn(Swal, 'fire');
      walletServiceMock.requireChain.and.resolveTo({ status: false });

      component.createProduct();
      flush();

      expect(Swal.fire).toHaveBeenCalled();
    }));
  });

  it('should add properties to the form', () => {
    component.propertiesForm = (component as any).formBuilder.group({
      type: ['test'],
      name: ['test property', Validators.required],
      value: ['some value', Validators.required]
    });

    component.addToProperties();

    expect(component.propertiesForm.value.type).toEqual('property');
  });

  it('should return without if form is invalid', () => {
    component.propertiesForm = (component as any).formBuilder.group({
      type: ['test'],
      name: [null, Validators.required],
      value: ['some value', Validators.required]
    });

    component.addToProperties();

    expect(component.propertiesForm.value.type).toEqual('test');
  });

  it('should display a specific collection', () => {
    component.collections = [{ name: 'test', collectionId: '123', _id: 'testid1547', story: 'test story', perks: 'test perks' }];
    component.createProductForm.controls['selectedCollection'].setValue('test');

    component.display();

    expect(component.createProductForm.value.story).toEqual('test story');
  });

  it('should change the image on an event', () => {
    const event = { target: { files: [new Blob(['test1.png', 'test2.png', 'test3.png'])], result: 'Test Result' } };
    const spyImage = spyOn<any>(component, 'setImageSource').and.callThrough();

    component.onChange(event);

    expect(spyImage).toHaveBeenCalledWith(event);
  });
});
