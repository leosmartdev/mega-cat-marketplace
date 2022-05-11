import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ErrorsService } from 'app/core/errors/errors.service';
import { RewardsService } from 'app/core/rewards/rewards.service';
import { of } from 'rxjs';

import { ListRewardsComponent } from './list-rewards.component';

describe('ListRewardsComponent', () => {
  let component: ListRewardsComponent;
  let fixture: ComponentFixture<ListRewardsComponent>;

  const rewardsServiceMock = jasmine.createSpyObj('RewardsService', ['listRewards', 'createReward', 'listUserRewards']);
  const errorsServiceMock = jasmine.createSpyObj('ErrorsService', ['openSnackBar']);
  rewardsServiceMock.listRewards.and.returnValue(of([]));

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ListRewardsComponent],
      providers: [
        { provide: ErrorsService, useValue: errorsServiceMock },
        { provide: RewardsService, useValue: rewardsServiceMock }
      ]
    }).compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(ListRewardsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
