import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { EditListingCardComponent } from './edit-listing-card.component';
import { FormsModule } from '@angular/forms';
import { CountdownModule } from 'ngx-countdown';

@NgModule({
  declarations: [EditListingCardComponent],
  imports: [FormsModule, CommonModule, CountdownModule],
  exports: [CommonModule, EditListingCardComponent]
})
export class EditListingCardModule {}
