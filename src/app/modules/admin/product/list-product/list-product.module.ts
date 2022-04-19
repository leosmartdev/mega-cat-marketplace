import { NgModule } from '@angular/core';
import { Route, RouterModule } from '@angular/router';
import { ListProductComponent } from 'app/modules/admin/product/list-product/list-product.component';
import { MatTableModule } from '@angular/material/table';
import { CommonModule } from '@angular/common';
import { ProductService } from 'app/core/product/product.service';
import { NgxPaginationModule } from 'ngx-pagination';

const listProductRoutes: Route[] = [
  {
    path: '',
    component: ListProductComponent
  }
];

@NgModule({
  declarations: [ListProductComponent],
  imports: [RouterModule.forChild(listProductRoutes), CommonModule, MatTableModule, NgxPaginationModule],
  providers: [ProductService]
})
export class ListProductModule {}
