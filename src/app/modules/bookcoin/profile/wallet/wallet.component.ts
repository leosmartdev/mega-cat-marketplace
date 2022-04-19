import { Component, OnInit } from '@angular/core';
import { WalletService } from 'app/core/wallet/wallet.service';
import { ErrorsService } from 'app/core/errors/errors.service';

@Component({
  selector: 'app-wallet',
  templateUrl: './wallet.component.html',
  styleUrls: ['./wallet.component.scss']
})
export class WalletComponent implements OnInit {
  isShowingMore: boolean = false;
  optionLabel: string;
  private moreLabel: string = 'View coming soon options';
  private lessLabel: string = 'Hide coming soon options';

  constructor(public walletService: WalletService, private snackBar: ErrorsService) {}

  ngOnInit(): void {
    this.optionLabel = this.moreLabel;
  }

  showMore() {
    this.isShowingMore = !this.isShowingMore;
    if (this.isShowingMore) {
      this.optionLabel = this.lessLabel;
    } else {
      this.optionLabel = this.moreLabel;
    }
  }

  connectToWallet(wallet: string) {
    switch (wallet) {
      case 'metamask': {
        if (this.walletService.isWalletActive()) {
          this.snackBar.openSnackBar('Metamask wallet is already logged in.', 'Okay');
          break;
        }
        this.walletService.connectToMetaMask();
        break;
      }
    }
  }
}
