import { ComponentFixture, TestBed } from '@angular/core/testing';
import { MatDialog, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { WizardDialogService } from '../wizard-dialog.service';

import { WizardDialogComponent } from './wizard-dialog.component';

describe('WizardDialogComponentComponent', () => {
  let component: WizardDialogComponent;
  let fixture: ComponentFixture<WizardDialogComponent>;
  const matDialogMock = jasmine.createSpyObj('MatDialog', ['close', 'closeAll']);
  const matDialogDataMock = jasmine.createSpyObj('MatDialogData', ['']);
  const wizardServiceMock = jasmine.createSpyObj('WizardDialogService', [
    'advanceStages',
    'setError',
    'getStages',
    'hasError',
    'showWizard',
    'close',
    'getError',
    'isReadyToClose',
    'failStage'
  ]);
  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [WizardDialogComponent],
      providers: [
        { provide: MatDialog, useValue: matDialogMock },
        { provide: MAT_DIALOG_DATA, useValue: matDialogDataMock },
        { provide: WizardDialogService, useValue: wizardServiceMock }
      ]
    }).compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(WizardDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should call advance stages of wizard service', () => {
    component.advanceStages();

    expect(wizardServiceMock.advanceStages).toHaveBeenCalled();
  });

  it('should set error', () => {
    component.makeError();

    expect(wizardServiceMock.setError).toHaveBeenCalledWith('OMG! Something went wrong');
  });

  it('should close all dialogs', () => {
    component.close();

    expect(matDialogMock.closeAll).toHaveBeenCalled();
  });
});
