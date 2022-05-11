import { Component, Inject, OnInit } from '@angular/core';
import { WizardDialogService } from '../wizard-dialog.service';
import { MatDialog, MAT_DIALOG_DATA, MatDialogActions } from '@angular/material/dialog';

@Component({
  selector: 'app-wizard-dialog-component',
  templateUrl: './wizard-dialog.component.html',
  styleUrls: ['./wizard-dialog.component.scss']
})
export class WizardDialogComponent implements OnInit {
  currentStage = 0;
  constructor(public wizard: WizardDialogService, @Inject(MAT_DIALOG_DATA) public data: any, private dialog: MatDialog) {}

  ngOnInit(): void {}

  close() {
    this.dialog.closeAll();
  }
}
