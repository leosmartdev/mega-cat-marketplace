import { NgModule } from '@angular/core';
import { Route, RouterModule } from '@angular/router';
import { PendingPayoutsComponent } from './pending-payouts.component';
import { MatTableModule } from '@angular/material/table';
import { CommonModule } from '@angular/common';
import { ProductService } from 'app/core/product/product.service';
import { NgxPaginationModule } from 'ngx-pagination';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatSelectModule } from '@angular/material/select';
import { SelectionModel } from '@angular/cdk/collections';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { RolesService } from 'app/core/roles/roles.service';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatInputModule } from '@angular/material/input';
import { MatButton, MatButtonModule } from '@angular/material/button';
import { MatPaginatorModule } from '@angular/material/paginator';
const pendingPayoutsRoutes: Route[] = [
  {
    path: '',
    component: PendingPayoutsComponent
  }
];

@NgModule({
  declarations: [PendingPayoutsComponent],
  imports: [
    RouterModule.forChild(pendingPayoutsRoutes),
    CommonModule,
    MatTableModule,
    NgxPaginationModule,
    MatFormFieldModule,
    MatInputModule,
    FormsModule,
    ReactiveFormsModule,
    MatSelectModule,
    MatButtonModule,
    MatPaginatorModule,
    MatCheckboxModule
  ],
  providers: [ProductService, RolesService]
})
export class PendingPayoutsModule {}
