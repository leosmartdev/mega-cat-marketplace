import { NgModule } from '@angular/core';
import { ErrorsService } from './errors.service';
import { MatSnackBarModule } from '@angular/material/snack-bar';

@NgModule({
  imports: [MatSnackBarModule],
  providers: [ErrorsService]
})
export class ErrorsModule {}
