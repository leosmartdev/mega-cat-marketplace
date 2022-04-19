import { NgModule } from '@angular/core';
import { Route, RouterModule } from '@angular/router';
import { MatButtonModule } from '@angular/material/button';
import { MatButtonToggleModule } from '@angular/material/button-toggle';
import { MatChipsModule } from '@angular/material/chips';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatDividerModule } from '@angular/material/divider';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatMenuModule } from '@angular/material/menu';
import { MatMomentDateModule } from '@angular/material-moment-adapter';
import { MatSelectModule } from '@angular/material/select';
import { FuseHighlightModule } from '@fuse/components/highlight';
import { SharedModule } from 'app/shared/shared.module';
import { MatListModule } from '@angular/material/list';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { CreateProductComponent } from 'app/modules/admin/product/create-product/create-product.component';
import { ProductService } from 'app/core/product/product.service';

const createProductRoutes: Route[] = [
  {
    path: '',
    component: CreateProductComponent
  }
];

@NgModule({
  declarations: [CreateProductComponent],
  imports: [
    RouterModule.forChild(createProductRoutes),
    MatButtonModule,
    MatButtonToggleModule,
    MatChipsModule,
    MatDatepickerModule,
    MatDividerModule,
    MatFormFieldModule,
    MatIconModule,
    MatInputModule,
    MatMenuModule,
    MatMomentDateModule,
    MatSelectModule,
    FuseHighlightModule,
    SharedModule,
    MatListModule,
    MatProgressSpinnerModule
  ],
  providers: [ProductService]
})
export class CreateProductModule {}
