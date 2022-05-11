import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Router } from '@angular/router';
import { BsModalRef, ModalOptions } from 'ngx-bootstrap/modal';

import { RewardCreatedPopupComponent } from './reward-created-popup.component';

describe('RewardCreatedPopupComponent', () => {
  let component: RewardCreatedPopupComponent;
  let fixture: ComponentFixture<RewardCreatedPopupComponent>;

  const modalOptionsMock = jasmine.createSpyObj('ModalOptions', ['initialState']);
  const routerMock = jasmine.createSpyObj('Router', ['navigate']);

  modalOptionsMock.initialState = {
    reward: {
      id: 1,
      title: 'Test-1',
      name: 'Test',
      isActive: true
    }
  };

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [RewardCreatedPopupComponent],
      providers: [BsModalRef, { provide: ModalOptions, useValue: modalOptionsMock }, { provide: Router, useValue: routerMock }]
    }).compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(RewardCreatedPopupComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
