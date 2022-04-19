import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { BannerComponent } from 'app/modules/elements/banner/banner.component';
import { ImgBoxComponent } from 'app/modules/elements/img-box/img-box.component';
import { ProductComponent } from 'app/modules/elements/product/product.component';

@NgModule({
  declarations: [BannerComponent, ImgBoxComponent, ProductComponent],
  imports: [CommonModule],
  exports: [BannerComponent, ImgBoxComponent, ProductComponent]
})
export class CardModule {}
