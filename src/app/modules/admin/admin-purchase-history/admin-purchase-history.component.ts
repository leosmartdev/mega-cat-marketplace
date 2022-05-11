import { Component, OnInit } from '@angular/core';
import { CartService } from 'app/core/cart/cart.service';

@Component({
  selector: 'app-admin-purchase-history',
  templateUrl: './admin-purchase-history.component.html',
  styleUrls: ['./admin-purchase-history.component.scss']
})
export class AdminPurchaseHistoryComponent implements OnInit {
  orders: any[] = [];
  selectedCollection: string = 'nftName';
  tableData = { pageIndex: 0 };
  itemperpage: number = 5;
  pageSizeOption = [2, 5, 10];
  totalData: number = 0;
  page: number = 1;
  valueName: string = '';
  names: any[] = [
    { key: 'Name', value: 'nftName' },
    { key: 'Seller Address', value: 'sellerAddress' },
    { key: 'Buyer Address', value: 'buyerAddress' },
    { key: 'Chain', value: 'chain' }
  ];
  displayedColumns: string[] = ['venlyId', 'image', 'name', 'collection', 'sellerWallet', 'buyerWallet', 'price', 'chain', 'datetime'];

  constructor(private cartService: CartService) {}

  ngOnInit(): void {
    this.getAllHistory();
  }

  getAllHistory() {
    this.cartService.getAdminPurchaseHistory((this.tableData.pageIndex + 1).toString(), this.itemperpage.toString()).subscribe((data: any) => {
      this.totalData = data.orderCount;
      this.orders = data.data;
    });
  }
  searchFilter(event) {
    this.valueName = event.target.value;
    if (event.target.value === '') {
      this.cartService.getAdminPurchaseHistory((this.tableData.pageIndex + 1).toString(), this.itemperpage.toString()).subscribe((data: any) => {
        this.totalData = data.orderCount;
        this.orders = data.data;
      });
    } else {
      this.cartService
        .getFilterAdminPurchaseHistory((this.tableData.pageIndex + 1).toString(), this.itemperpage.toString(), this.selectedCollection, event.target.value)
        .subscribe((data: any) => {
          this.totalData = data.orderCount;
          this.orders = data.data;
        });
    }
  }
  onChangedPage(event) {
    this.tableData = { pageIndex: event.pageIndex };
    if (this.valueName === '') {
      this.cartService.getAdminPurchaseHistory((this.tableData.pageIndex + 1).toString(), event.pageSize).subscribe((data: any) => {
        this.totalData = data.orderCount;
        this.orders = data.data;
      });
    } else {
      this.cartService.getFilterAdminPurchaseHistory((this.tableData.pageIndex + 1).toString(), event.pageSize, this.selectedCollection, this.valueName).subscribe((data: any) => {
        this.totalData = data.orderCount;
        this.orders = data.data;
      });
    }
  }
}
