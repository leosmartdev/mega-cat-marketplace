import { fakeAsync, flush, TestBed } from '@angular/core/testing';
import { MatDialog, MatDialogRef } from '@angular/material/dialog';
import { of } from 'rxjs';

import { WizardDialogService } from './wizard-dialog.service';
import { WizardStage } from './wizard-stage.model';

describe('WizardDialogService', () => {
  let service: WizardDialogService;
  const matDialogMock = jasmine.createSpyObj('MatDialog', ['close', 'open', 'closeAll']);
  const matDialogRefMock = jasmine.createSpyObj('MatDialog', ['afterClosed', 'close']);

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        { provide: MatDialog, useValue: matDialogMock },
        { provide: MatDialogRef, useValue: matDialogRefMock }
      ]
    });
    service = TestBed.inject(WizardDialogService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should display a wizard', () => {
    matDialogMock.open.and.returnValue(matDialogRefMock);
    const wizardStages: WizardStage[] = [new WizardStage()];
    matDialogRefMock.afterClosed.and.returnValue(of({ status: 'success' }));
    const spyAdvance = spyOn(service, 'advanceStages');
    const spyDefault = spyOn<any>(service, 'defaultAfterClose');

    service.showWizard('test', wizardStages, true);

    expect(spyAdvance).toHaveBeenCalled();
    expect(spyDefault).toHaveBeenCalled();
  });

  it('should get stages', () => {
    const stage = new WizardStage();
    service.stages = [stage];

    const response = service.getStages();

    expect(response).toEqual(service.stages);
  });

  it('should close all opened dialogs', () => {
    service.close();

    expect(matDialogMock.closeAll).toHaveBeenCalled();
  });

  it('should get error', () => {
    service.error = 'Some error';

    expect(service.getError()).toEqual('Some error');
  });

  it('should set error', () => {
    service.setError('Some error');

    expect(service.error).toEqual('Some error');
  });

  it('should set values to default afetr close', () => {
    (service as any).defaultAfterClose();

    expect(service.stages).toEqual([]);
    expect(service.error).toEqual('');
    expect(service.isClosing).toEqual(false);
  });

  it('should fail a stage', () => {
    const spyError = spyOn(service, 'setError');
    const stage = new WizardStage();
    stage.status = 'active';
    service.stages = [stage];

    service.failStage('Stage Failed!');

    expect(service.stages[0].status).toEqual('failed');
    expect(spyError).toHaveBeenCalledWith('Stage Failed!');
  });

  it('should close wizard when all stages are complete', fakeAsync(() => {
    spyOn<any>(service, 'checkAllStagesComplete').and.returnValue(true);
    service.wizard = matDialogRefMock;
    const stage1 = new WizardStage();
    stage1.status = 'active';
    const stage2 = new WizardStage();
    stage2.status = 'dormant';
    service.stages = [stage1, stage2];

    service.advanceStages();
    flush();

    expect(service.stages[0].status).toEqual('finished');
    expect(service.stages[1].status).toEqual('active');
  }));

  describe('Is Ready To Close', () => {
    it('should return true', () => {
      service.isClosing = true;

      expect(service.isReadyToClose()).toBe(true);
    });

    it('should return false', () => {
      service.isClosing = false;

      expect(service.isReadyToClose()).toBe(false);
    });
  });

  describe('Has Error', () => {
    it('should return true', () => {
      service.error = 'Some error';

      expect(service.hasError()).toBe(true);
    });

    it('should return false', () => {
      service.error = null;

      expect(service.hasError()).toBe(false);
    });
  });

  describe('Check All Stages Complete', () => {
    it('should return true', () => {
      const stage = new WizardStage();
      stage.status = 'finished';
      service.stages = [stage];

      const response = (service as any).checkAllStagesComplete();

      expect(response).toBe(true);
    });

    it('should return false', () => {
      const stage = new WizardStage();
      stage.status = 'active';
      service.stages = [stage];

      const response = (service as any).checkAllStagesComplete();

      expect(response).toBe(false);
    });
  });
});
