import { MatDialog, MatDialogRef } from '@angular/material/dialog';
import { WizardDialogComponent } from './wizard-dialog-component/wizard-dialog.component';
import { Injectable } from '@angular/core';
import { WizardStage } from './wizard-stage.model';

@Injectable({
  providedIn: 'root'
})
export class WizardDialogService {
  public testMode: boolean = false;
  title: string;
  wizard: MatDialogRef<WizardDialogComponent>;
  stages: WizardStage[];
  error: string;
  isClosing: boolean = false;

  constructor(private dialog: MatDialog) {}

  showWizard(title: string, stages: WizardStage[], startInitialStage = false, testMode = false) {
    this.title = title;
    this.stages = stages;
    this.testMode = testMode;
    const data = {};
    this.wizard = this.dialog.open(WizardDialogComponent, { data });
    this.wizard.afterClosed().subscribe((result) => {
      this.defaultAfterClose(result);
    });

    if (startInitialStage) {
      this.advanceStages();
    }
  }

  getStages() {
    return this.stages;
  }
  close() {
    this.dialog.closeAll();
  }

  hasError() {
    return Boolean(this.error);
  }

  getError() {
    return this.error;
  }

  setError(errorMessage: string) {
    this.error = errorMessage;
  }

  isReadyToClose() {
    return this.isClosing;
  }

  advanceStages() {
    const stages = this.getStages();

    const firstActiveIndex = stages.findIndex((stage) => stage.status === 'active');
    if (firstActiveIndex >= 0) {
      stages[firstActiveIndex].status = 'finished';
    }

    const firstDormantIndex = stages.findIndex((stage) => stage.status === 'dormant');
    if (firstDormantIndex >= 0) {
      stages[firstDormantIndex].status = 'active';
    }

    const allStagesComplete = this.checkAllStagesComplete();
    if (allStagesComplete) {
      this.isClosing = true;
      const that = this;

      setTimeout(() => {
        that.wizard.close();
      }, 1500);
    }
  }

  failStage(error: any) {
    const message: string = error.message ?? error; // backwards compatibility; some code uses { message: ... }, newer code just supplies a string.
    this.setError(message);
    const stages = this.getStages();

    const firstActiveIndex = stages.findIndex((stage) => stage.status === 'active');
    if (firstActiveIndex >= 0) {
      stages[firstActiveIndex].status = 'failed';
    }
  }

  private checkAllStagesComplete() {
    let allComplete = true;
    this.stages.forEach((stage) => {
      if (stage.status !== 'finished') {
        allComplete = false;
      }
    });

    return allComplete;
  }

  private defaultAfterClose(result) {
    this.stages = [];
    this.error = '';
    this.isClosing = false;
  }
}
