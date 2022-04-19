import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NftCardComponent } from 'app/modules/elements/nft-card/nft-card.component';
import { FormsModule } from '@angular/forms';
import { CountdownModule } from 'ngx-countdown';

@NgModule({
  declarations: [NftCardComponent],
  imports: [FormsModule, CommonModule, CountdownModule],
  exports: [CommonModule, NftCardComponent]
})
export class NftCardModule {}
