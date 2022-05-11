import { ComponentFixture, TestBed } from '@angular/core/testing';
import { FormBuilder } from '@angular/forms';
import { ErrorsService } from 'app/core/errors/errors.service';
import { ProductService } from 'app/core/product/product.service';
import { RewardsService } from 'app/core/rewards/rewards.service';
import { WizardDialogService } from 'app/shared/wizard-dialog-service/wizard-dialog.service';
import { BsModalService } from 'ngx-bootstrap/modal';
import { of } from 'rxjs';

import { CreateRewardComponent } from './create-reward.component';

describe('CreateRewardComponent', () => {
  let component: CreateRewardComponent;
  let fixture: ComponentFixture<CreateRewardComponent>;

  const productServiceMock = jasmine.createSpyObj('ProductService', ['getAllCollections']);
  const rewardsServiceMock = jasmine.createSpyObj('RewardsService', ['listRewards', 'createReward', 'listUserRewards']);
  const wizardServiceMock = jasmine.createSpyObj('WizardDialogService', ['advanceStages', 'showWizard', 'setError', 'failStage', 'close']);
  const errorsServiceMock = jasmine.createSpyObj('ErrorsService', ['openSnackBar']);
  const bsModalServiceMock = jasmine.createSpyObj('BsModalService', ['show']);

  productServiceMock.getAllCollections.and.returnValue(of({}));

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [CreateRewardComponent],
      providers: [
        FormBuilder,
        { provide: ProductService, useValue: productServiceMock },
        { provide: RewardsService, useValue: rewardsServiceMock },
        { provide: WizardDialogService, useValue: wizardServiceMock },
        { provide: ErrorsService, useValue: errorsServiceMock },
        { provide: BsModalService, useValue: bsModalServiceMock }
      ]
    }).compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(CreateRewardComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
