import { Injectable } from '@angular/core';
import { MatSnackBar } from '@angular/material/snack-bar';

@Injectable()
export class ErrorsService {
  constructor(private snackBar: MatSnackBar) {}

  openSnackBar(message: string, action: string) {
    this.snackBar.open(message, action, {
      panelClass: ['opened-snackbar-modal'],
      duration: 1000
    });
  }

  openSnackBarTop(message: string, action: string, milliseconds: number = 2000, success: boolean = true) {
    const additionalClass = success ? 'success' : 'error';
    this.snackBar.open(message, action, {
      panelClass: ['opened-snackbar-modal', additionalClass],
      duration: milliseconds,
      horizontalPosition: 'center',
      verticalPosition: 'top'
    });
  }
}
