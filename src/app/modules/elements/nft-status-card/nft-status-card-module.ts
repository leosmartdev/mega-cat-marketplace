import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NftStatusCardComponent } from './nft-status-card.component';
import { FormsModule } from '@angular/forms';
import { CountdownModule } from 'ngx-countdown';

@NgModule({
  declarations: [NftStatusCardComponent],
  imports: [FormsModule, CommonModule, CountdownModule],
  exports: [CommonModule, NftStatusCardComponent]
})
export class NftStatusCardModule {}
