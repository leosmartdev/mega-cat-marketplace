import { ComponentFixture, TestBed } from '@angular/core/testing';
import { FormBuilder } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { ErrorsService } from 'app/core/errors/errors.service';
import { ProductService } from 'app/core/product/product.service';
import { RewardsService } from 'app/core/rewards/rewards.service';
import { WizardDialogService } from 'app/shared/wizard-dialog-service/wizard-dialog.service';
import { of } from 'rxjs';

import { EditCollectionComponent } from './edit-collection.component';

describe('EditCollectionComponent', () => {
  let component: EditCollectionComponent;
  let fixture: ComponentFixture<EditCollectionComponent>;
  const productServiceMock = jasmine.createSpyObj('ProductService', ['getAllCollections', 'getCollectionDetail']);
  const errorsServiceMock = jasmine.createSpyObj('ErrorsService', ['openSnackBar']);
  const routerMock = jasmine.createSpyObj('Router', ['navigate']);
  const activatedRouteMock = jasmine.createSpyObj('ActivatedRoute', ['snapshot']);
  const rewardsServiceMock = jasmine.createSpyObj('RewardsService', ['listRewards', 'createReward', 'listUnassignedRewards']);
  const wizardServiceMock = jasmine.createSpyObj('WizardDialogService', ['advanceStages', 'showWizard', 'setError', 'failStage', 'close']);
  rewardsServiceMock.listUnassignedRewards.and.returnValue(of([]));
  productServiceMock.getCollectionDetail.and.returnValue(of({}));

  activatedRouteMock.snapshot = {
    params: {
      smartContractAddress: 'something',
      chain: 'something'
    }
  };

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [EditCollectionComponent],
      providers: [
        { provide: ProductService, useValue: productServiceMock },
        { provide: ErrorsService, useValue: errorsServiceMock },
        { provide: Router, useValue: routerMock },
        { provide: ActivatedRoute, useValue: activatedRouteMock },
        { provide: RewardsService, useValue: rewardsServiceMock },
        { provide: WizardDialogService, useValue: wizardServiceMock },
        FormBuilder
      ]
    }).compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(EditCollectionComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  afterEach(() => {
    fixture.destroy();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
