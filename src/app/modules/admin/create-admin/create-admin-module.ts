import { NgModule } from '@angular/core';
import { Route, RouterModule } from '@angular/router';
import { CreateAdminComponent } from './create-admin.component';
import { MatTableModule } from '@angular/material/table';
import { CommonModule } from '@angular/common';
import { ProductService } from 'app/core/product/product.service';
import { NgxPaginationModule } from 'ngx-pagination';
import { MatFormFieldModule } from '@angular/material/form-field';
import { RolesService } from 'app/core/roles/roles.service';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatInputModule } from '@angular/material/input';
const createAdminRoutes: Route[] = [
  {
    path: '',
    component: CreateAdminComponent
  }
];

@NgModule({
  declarations: [CreateAdminComponent],
  imports: [RouterModule.forChild(createAdminRoutes), CommonModule, MatTableModule, NgxPaginationModule, MatFormFieldModule, MatInputModule, FormsModule, ReactiveFormsModule],
  providers: [ProductService, RolesService]
})
export class CreateAdminModule {}
