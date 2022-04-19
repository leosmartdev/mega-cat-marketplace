import { NgModule } from '@angular/core';
import { HttpClientModule } from '@angular/common/http';
import { ProductService } from 'app/core/product/product.service';

@NgModule({
  imports: [HttpClientModule],
  providers: [ProductService]
})
export class ProductModule {}
