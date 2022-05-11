import { of } from 'rxjs';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { HttpClientTestingModule } from '@angular/common/http/testing';

import { RewardsExplorerComponent } from './rewards-explorer.component';
import { RewardsService } from 'app/core/rewards/rewards.service';

describe('RewardsExplorerComponent', () => {
  let component: RewardsExplorerComponent;
  let fixture: ComponentFixture<RewardsExplorerComponent>;
  const rewardsServiceMock = jasmine.createSpyObj('RewardsService', ['getResource']);
  rewardsServiceMock.getResource.and.returnValue(of(new Blob()));

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [RewardsExplorerComponent],
      imports: [HttpClientTestingModule],
      providers: [{ provide: RewardsService, useValue: rewardsServiceMock }]
    }).compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(RewardsExplorerComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
