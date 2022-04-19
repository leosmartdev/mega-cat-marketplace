import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Router } from '@angular/router';
import { BsModalRef, ModalOptions } from 'ngx-bootstrap/modal';

import { NftCreatedPopupComponent } from './nft-created-popup.component';

describe('NftCreatedPopupComponent', () => {
  let component: NftCreatedPopupComponent;
  let fixture: ComponentFixture<NftCreatedPopupComponent>;
  const bsModalRefMock = jasmine.createSpyObj('BsModalRef', ['hide']);
  const modalOptionsMock = jasmine.createSpyObj('ModalOptions', ['initialState']);
  const routerMock = jasmine.createSpyObj('Router', ['navigate', 'navigateByUrl']);

  modalOptionsMock.initialState = {
    nft: {
      metadata: {
        image: 'an image',
        name: 'some name',
        description: 'just another day'
      },
      transactionHash: '0x1324098',
      tokenIds: ['1098']
    }
  };

  routerMock.navigate.and.callFake((rout) => {
    // do something with route?
  });

  const spyNavigate = routerMock.navigateByUrl.and.callFake((rout) => {});

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [NftCreatedPopupComponent],
      providers: [
        { provide: BsModalRef, useValue: bsModalRefMock },
        { provide: ModalOptions, useValue: modalOptionsMock },
        { provide: Router, useValue: routerMock }
      ]
    }).compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(NftCreatedPopupComponent);
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
