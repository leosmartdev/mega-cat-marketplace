import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { MatTabsModule } from '@angular/material/tabs';
import { SharedModule } from 'app/shared/shared.module';
import { WalletConnectComponent } from './wallet-connect.component';
import { walletConnectRoutes } from './wallet-connect.routing';

@NgModule({
  declarations: [WalletConnectComponent],
  imports: [CommonModule, RouterModule.forChild(walletConnectRoutes), MatTabsModule, SharedModule]
})
export class WalletConnectModule {}
