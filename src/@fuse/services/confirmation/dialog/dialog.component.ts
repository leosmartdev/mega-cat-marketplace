import { Component, Inject, OnInit, ViewEncapsulation } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { FuseConfirmationConfig } from '@fuse/services/confirmation/confirmation.types';

@Component({
  selector: 'fuse-confirmation-dialog',
  templateUrl: './dialog.component.html',
  encapsulation: ViewEncapsulation.None
})
export class FuseConfirmationDialogComponent implements OnInit {
  /**
   * Constructor
   */
  constructor(@Inject(MAT_DIALOG_DATA) public data: FuseConfirmationConfig, public matDialogRef: MatDialogRef<FuseConfirmationDialogComponent>) {}

  // -----------------------------------------------------------------------------------------------------
  // @ Lifecycle hooks
  // -----------------------------------------------------------------------------------------------------

  /**
   * On init
   */
  ngOnInit(): void {}

  // -----------------------------------------------------------------------------------------------------
  // @ Public methods
  // -----------------------------------------------------------------------------------------------------
}
