import { Component, ViewEncapsulation, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { ErrorsService } from 'app/core/errors/errors.service';
import { ProductService } from 'app/core/product/product.service';
import Swal from 'sweetalert2/dist/sweetalert2.js';
import { WalletService } from 'app/core/wallet/wallet.service';
@Component({
  selector: 'example',
  templateUrl: './dashboard.component.html',
  encapsulation: ViewEncapsulation.None
})
export class DashboardComponent implements OnInit {
  newNFTs: null;
  listedForSaleNFTs: null;
  soldNFTs: null;
  totalUsers: null;
  /**
   * Constructor
   */
  constructor(private _router: Router, private _productService: ProductService, private _errorsService: ErrorsService, private walletService: WalletService) {}

  ngOnInit(): void {
    const walletAddress = this.walletService.currentAccount;
    if (!walletAddress) {
      Swal.fire({
        icon: 'info',
        title: 'Wallet Not Connected',
        text: 'Please connect your wallet before proceeding!'
      }).then((result) => {
        this._router.navigate(['/home']);
      });
    }
    this.getNFTsStats();
  }

  getNFTsStats(): void {
    this._productService.getStats().subscribe(
      (data) => {
        this.newNFTs = data.data.new;
        this.listedForSaleNFTs = data.data.sale;
        this.soldNFTs = data.data.sold;
        this.totalUsers = data.data.users;
      },
      () => {
        this._errorsService.openSnackBar('Something went wrong!', 'Error');
      }
    );
  }
}
