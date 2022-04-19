import { BsModalRef, ModalOptions } from 'ngx-bootstrap/modal';
import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MintPopUpComponent } from './mint-pop-up.component';

describe('MintPopUpComponent', () => {
  let component: MintPopUpComponent;
  let fixture: ComponentFixture<MintPopUpComponent>;
  const modalOptions = jasmine.createSpyObj('ModalOptions', ['initialState']);
  modalOptions.intialState = {
    tokenIds: [],
    contractAddress: '0x203948230948',
    transactions: []
  };
  const bsModalRefMock = jasmine.createSpyObj('BsModalRef', ['hide']);

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [MintPopUpComponent],
      providers: [
        { provide: BsModalRef, useValue: bsModalRefMock },
        { provide: ModalOptions, useValue: modalOptions }
      ]
    }).compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(MintPopUpComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should hide Ref modal', () => {
    component.hideModal();

    expect(bsModalRefMock.hide).toHaveBeenCalledTimes(1);
  });

  it('should return build links from token ids', () => {
    const tokenIds = ['123'];
    const testnet = '';
    component.state = {
      chain: 'ethereum',
      contractAddress: 'testAddress'
    };
    const url = `https://${testnet}opensea.io/assets/${component.state.contractAddress}/${tokenIds[0]}`;

    const response = component.buildLinks(tokenIds);

    expect(response).toEqual([url]);
  });
});
