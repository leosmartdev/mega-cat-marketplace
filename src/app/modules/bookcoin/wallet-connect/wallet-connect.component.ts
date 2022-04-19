import { Component, OnInit } from '@angular/core';
import { WalletService } from 'app/core/wallet/wallet.service';
import { SharedService } from 'app/core/shared/shared.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-wallet-connect',
  templateUrl: './wallet-connect.component.html',
  styleUrls: ['./wallet-connect.component.scss']
})
export class WalletConnectComponent implements OnInit {
  constructor(public walletService: WalletService, private sharedService: SharedService, private router: Router) {}

  ngOnInit(): void {
    this.sharedService.url.next(this.router.url);
  }
}
