import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NftCardBkcnComponent } from 'app/modules/elements/nft-card-bkcn/nft-card-bkcn.component';
import { FormsModule } from '@angular/forms';
import { CountdownModule } from 'ngx-countdown';
import { RouterModule } from '@angular/router';

@NgModule({
  declarations: [NftCardBkcnComponent],
  imports: [FormsModule, CommonModule, CountdownModule, RouterModule],
  exports: [CommonModule, NftCardBkcnComponent]
})
export class NftCardBkcnModule {}
