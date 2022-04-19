import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FuseCardComponent } from '@fuse/components/card/card.component';
import { RouterTestingModule } from '@angular/router/testing';

@NgModule({
  declarations: [FuseCardComponent],
  imports: [
    CommonModule
    //RouterTestingModule
  ],
  exports: [FuseCardComponent]
})
export class FuseCardModule {}
