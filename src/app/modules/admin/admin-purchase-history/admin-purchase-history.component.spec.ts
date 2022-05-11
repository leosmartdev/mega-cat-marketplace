import { ComponentFixture, TestBed } from '@angular/core/testing';
import { of } from 'rxjs';
import { CartService } from 'app/core/cart/cart.service';
import { AdminPurchaseHistoryComponent } from './admin-purchase-history.component';

describe('AdminPurchaseHistoryComponent', () => {
  let component: AdminPurchaseHistoryComponent;
  let fixture: ComponentFixture<AdminPurchaseHistoryComponent>;
  const cartServiceMock = jasmine.createSpyObj('CartService', ['getAdminPurchaseHistory', 'getFilterAdminPurchaseHistory']);
  cartServiceMock.getAdminPurchaseHistory.and.returnValue(of({ message: 'Purchase History was successfully get!', orderCount: 0, data: [] }));
  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [AdminPurchaseHistoryComponent],
      providers: [{ provide: CartService, useValue: cartServiceMock }]
    }).compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(AdminPurchaseHistoryComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  afterEach(() => {
    fixture.destroy();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  describe('onChangedPage', () => {
    it('should respond with filter purchase history on getAdminPurchaseHistory', () => {
      const data = [{ sellerAddress: '0jh898y89' }, { sellerAddress: '099u3dubhdb' }];
      component.valueName = '';
      cartServiceMock.getAdminPurchaseHistory.and.returnValue(of({ message: 'test', orderCount: 2, data: data }));
      component.onChangedPage({ pageIndex: 0, pageSize: 5 });
      expect(component.orders).toEqual(data);
    });

    it('should respond with filter purchase history on getFilterAdminPurchaseHistory', () => {
      const data = [{ sellerAddress: '0jh898y89' }, { sellerAddress: '089u3dubhdb' }];
      component.valueName = '89';
      component.selectedCollection = 'sellerAddress';
      cartServiceMock.getFilterAdminPurchaseHistory.and.returnValue(of({ message: 'test', orderCount: 2, data: data }));
      component.onChangedPage({ pageIndex: 0, pageSize: 5 });
      expect(component.orders).toEqual(data);
    });
  });

  describe('searchFilter', () => {
    it('should respond with filter purchase history on getAdminPurchaseHistory', () => {
      const data = [{ sellerAddress: '0jh898y89' }, { sellerAddress: '099u3dubhdb' }];
      component.tableData = { pageIndex: 0 };
      component.itemperpage = 5;
      cartServiceMock.getAdminPurchaseHistory.and.returnValue(of({ message: 'test', orderCount: 2, data: data }));
      component.searchFilter({ target: { value: '' } });
      expect(component.orders).toEqual(data);
    });

    it('should respond with filter purchase history on getFilterAdminPurchaseHistory', () => {
      const data = [{ sellerAddress: '0jh898y89' }, { sellerAddress: '089u3dubhdb' }];
      component.tableData = { pageIndex: 0 };
      component.itemperpage = 5;
      component.selectedCollection = 'sellerAddress';
      cartServiceMock.getFilterAdminPurchaseHistory.and.returnValue(of({ message: 'test', orderCount: 2, data: data }));
      component.searchFilter({ target: { value: '89' } });
      expect(component.orders).toEqual(data);
    });
  });
});
