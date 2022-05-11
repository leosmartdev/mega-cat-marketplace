import { NgModule } from '@angular/core';
import { Route, RouterModule } from '@angular/router';
import { AdminPurchaseHistoryComponent } from './admin-purchase-history.component';
import { MatTableModule } from '@angular/material/table';
import { CommonModule } from '@angular/common';
import { NgxPaginationModule } from 'ngx-pagination';
import { MatSelectModule } from '@angular/material/select';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatPaginatorModule } from '@angular/material/paginator';
const adminPurchaseHistoryRoutes: Route[] = [
  {
    path: '',
    component: AdminPurchaseHistoryComponent
  }
];

@NgModule({
  declarations: [AdminPurchaseHistoryComponent],
  imports: [
    RouterModule.forChild(adminPurchaseHistoryRoutes),
    CommonModule,
    MatTableModule,
    NgxPaginationModule,
    MatSelectModule,
    MatFormFieldModule,
    MatInputModule,
    MatPaginatorModule
  ]
})
export class AdminPurchaseHistoryModule {}
