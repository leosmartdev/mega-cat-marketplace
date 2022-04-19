import { ComponentFixture, TestBed } from '@angular/core/testing';
import { RouterTestingModule } from '@angular/router/testing';
import { PendingPayoutsComponent } from './pending-payouts.component';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { HttpClientModule } from '@angular/common/http';
import { AngularFireAuthModule } from '@angular/fire/compat/auth';
import { AngularFireModule } from '@angular/fire/compat';
import { environment } from 'environments/environment';
import { ReactiveFormsModule } from '@angular/forms';
import { AuthService } from 'app/core/auth/auth.service';
import { Observable, of, throwError } from 'rxjs';
import { NgxPaginationModule } from 'ngx-pagination';
import { ErrorsService } from 'app/core/errors/errors.service';
import { RolesService } from 'app/core/roles/roles.service';

describe('PendingPayoutsComponent', () => {
  let component: PendingPayoutsComponent;
  let fixture: ComponentFixture<PendingPayoutsComponent>;
  let httpMock: HttpTestingController;

  const authServiceMock = jasmine.createSpyObj('AuthService', ['isSuperAdmin', 'isAdmin']);
  authServiceMock.isSuperAdmin.and.returnValue(of(true));
  const errorServiceMock = jasmine.createSpyObj('ErrorsService', ['openSnackBar']);
  const rolesServiceMock = jasmine.createSpyObj('RolesService', ['getPendingPayouts', 'approveAllPayouts', 'approvePayout']);
  rolesServiceMock.getPendingPayouts.and.returnValue(of({ payouts: [] }));

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [PendingPayoutsComponent],
      imports: [
        HttpClientModule,
        ReactiveFormsModule,
        HttpClientTestingModule,
        NgxPaginationModule,
        RouterTestingModule,
        AngularFireModule.initializeApp(environment.firebase),
        AngularFireAuthModule
      ],
      providers: [
        { provide: AuthService, useValue: authServiceMock },
        { provide: ErrorsService, useValue: errorServiceMock },
        { provide: RolesService, useValue: rolesServiceMock }
      ]
    }).compileComponents();
    httpMock = TestBed.get(HttpTestingController);
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(PendingPayoutsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  afterEach(() => {
    fixture.destroy();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  describe('approveAll', () => {
    it('should approve all pending payouts', () => {
      rolesServiceMock.approveAllPayouts.and.returnValue(of({ payouts: [] }));
      const spyGetListings = spyOn(component, 'getPendingPayouts');

      component.approveAll();

      expect(spyGetListings).toHaveBeenCalledTimes(1);
    });

    it('should respond with a snackbar error', () => {
      rolesServiceMock.approveAllPayouts.and.returnValue(throwError({ error: { message: 'Failed to approve payouts' } }));

      component.approveAll();

      expect(errorServiceMock.openSnackBar).toHaveBeenCalledWith('Failed to approve payouts', 'Error');
    });
  });

  describe('approvePayout', () => {
    it('should approve a single payout', () => {
      rolesServiceMock.approvePayout.and.returnValue(of({ payout: {} }));
      const spyGetListings = spyOn(component, 'getPendingPayouts');

      component.approvePayout(12);

      expect(spyGetListings).toHaveBeenCalledTimes(1);
    });

    it('should respond with a snackbar error', () => {
      rolesServiceMock.approvePayout.and.returnValue(throwError({ error: { message: 'Failed to approve payouts' } }));

      component.approvePayout(12);

      expect(errorServiceMock.openSnackBar).toHaveBeenCalledWith('Failed to approve payouts', 'Error');
    });
  });

  describe('isSuperAdmin', () => {
    it('should return true', () => {
      authServiceMock.isAdmin.and.returnValue(true);

      expect(component.isSuperAdmin()).toEqual(true);
    });

    it('should return false', () => {
      authServiceMock.isAdmin.and.returnValue(false);

      expect(component.isSuperAdmin()).toEqual(false);
    });
  });

  describe('filter', () => {
    it('should respond with all payouts', () => {
      const data = [{ status: 'approved' }, { status: 'pending' }];
      component.payouts = data;

      component.filter({ value: 'all' });

      expect(component.filteredPayouts.length).toEqual(2);
      expect(component.filteredPayouts).toEqual(data);
    });

    it('should respond with only pending payouts', () => {
      const data = [{ status: 'approved' }, { status: 'pending' }];
      component.payouts = data;

      component.filter({ value: 'pending' });

      expect(component.filteredPayouts.length).toEqual(1);
      expect(component.filteredPayouts[0]).toEqual(data[1]);
    });

    it('should respond with only pending payouts', () => {
      const data = [{ status: 'approved' }, { status: 'pending' }];
      component.payouts = data;

      component.filter({ value: 'approved' });

      expect(component.filteredPayouts.length).toEqual(1);
      expect(component.filteredPayouts[0]).toEqual(data[0]);
    });
  });

  describe('isAllSelected', () => {
    it('should return true', () => {
      component.filteredPayouts = [];

      expect(component.isAllSelected()).toEqual(true);
    });

    it('should return false', () => {
      component.filteredPayouts = [{ status: 'pending' }];

      expect(component.isAllSelected()).toEqual(false);
    });
  });

  describe('masterToggle', () => {
    it('should clear the selection', () => {
      component.filteredPayouts = [];
      spyOn(component.selection, 'clear');

      component.masterToggle();

      expect(component.selection.clear).toHaveBeenCalledTimes(1);
    });

    it('should slect the all pending payouts', () => {
      component.filteredPayouts = [{ status: 'pending' }];
      spyOn(component.selection, 'select');

      component.masterToggle();

      expect(component.selection.select).toHaveBeenCalledOnceWith(component.filteredPayouts[0]);
    });
  });
});
