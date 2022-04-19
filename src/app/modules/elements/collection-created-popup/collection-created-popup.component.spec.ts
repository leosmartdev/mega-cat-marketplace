import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CollectionCreatedPopupComponent } from './collection-created-popup.component';
import { BsModalRef, ModalOptions } from 'ngx-bootstrap/modal';
import { Router } from '@angular/router';

describe('CollectionCreatedPopupComponent', () => {
  let component: CollectionCreatedPopupComponent;
  let fixture: ComponentFixture<CollectionCreatedPopupComponent>;
  const modalMock = jasmine.createSpyObj('ModalOptions', ['initialState']);
  const bsModalRefMock = jasmine.createSpyObj('BsModalRef', ['hide']);
  modalMock.initialState = {
    collection: {
      name: 'hi',
      description: 'hello',
      image: 'https://google.com',
      symbol: 'hi',
      confirmed: 'false',
      transactionHash: 'txHash',
      secretType: 'MATIC'
    }
  };

  const routerMock = jasmine.createSpyObj('Router', ['navigate', 'navigateByUrl']);
  routerMock.navigate.and.callFake((rout) => {});

  const spyNavigate = routerMock.navigateByUrl.and.callFake((rout) => {});

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [CollectionCreatedPopupComponent],
      imports: [],
      providers: [
        { provide: BsModalRef, useValue: bsModalRefMock },
        { provide: ModalOptions, useValue: modalMock },
        { provide: Router, useValue: routerMock }
      ]
    }).compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(CollectionCreatedPopupComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should go back to profile', () => {
    component.goBackToProfile();

    expect(spyNavigate).toHaveBeenCalledWith('/profile');
  });
});
