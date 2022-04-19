import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DeployComponent } from './deploy.component';
import { Route, RouterModule } from '@angular/router';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatTableModule } from '@angular/material/table';
import { NgxPaginationModule } from 'ngx-pagination';

const listAdminRoutes: Route[] = [
  {
    path: '',
    component: DeployComponent
  }
];

@NgModule({
  declarations: [DeployComponent],
  imports: [RouterModule.forChild(listAdminRoutes), CommonModule, MatTableModule, NgxPaginationModule, MatFormFieldModule, MatInputModule, FormsModule, ReactiveFormsModule]
})
export class DeployModule {}
