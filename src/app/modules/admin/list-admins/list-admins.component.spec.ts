import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ListAdminsComponent } from './list-admins.component';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { HttpClientModule } from '@angular/common/http';
import { RouterTestingModule } from '@angular/router/testing';
import { AngularFireAuthModule } from '@angular/fire/compat/auth';
import { AngularFireModule } from '@angular/fire/compat';
import { environment } from 'environments/environment';
import { AuthService } from 'app/core/auth/auth.service';
import { of } from 'rxjs';
import { mockUser } from 'app/core/auction/spec-files/mocked';
import { RolesService } from 'app/core/roles/roles.service';
import { Role } from 'app/core/models/role';
import { NgxPaginationModule } from 'ngx-pagination';

describe('ListAdminsComponent', () => {
  let component: ListAdminsComponent;
  let fixture: ComponentFixture<ListAdminsComponent>;
  let httpMock: HttpTestingController;

  const authServiceMock = jasmine.createSpyObj('AuthService', ['isSuperAdmin', 'user']);
  authServiceMock.isSuperAdmin.and.returnValue(of(true));
  const rolesServiceMock = jasmine.createSpyObj('RolesService', ['listAdmins', 'revokeAdminRole']);
  rolesServiceMock.listAdmins.and.returnValue(of({ users: [mockUser] }));

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ListAdminsComponent],
      imports: [HttpClientModule, HttpClientTestingModule, RouterTestingModule, AngularFireModule.initializeApp(environment.firebase), AngularFireAuthModule, NgxPaginationModule],
      providers: [
        { provide: AuthService, useValue: authServiceMock },
        { provide: RolesService, useValue: rolesServiceMock }
      ]
    }).compileComponents();
    httpMock = TestBed.get(HttpTestingController);
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(ListAdminsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should revoke an admin to user', () => {
    rolesServiceMock.revokeAdminRole.and.returnValue(of(mockUser));
    const spyNavigate = spyOn((component as any)._router, 'navigateByUrl');

    component.makeUser(mockUser.email);

    expect(rolesServiceMock.revokeAdminRole).toHaveBeenCalledTimes(1);
    expect(spyNavigate).toHaveBeenCalledWith('/dashboard');
  });

  it('should return false', () => {
    authServiceMock.user = null;

    expect(component.isSuperAdmin()).toEqual(false);
  });

  it('should return true', () => {
    const expectedResponse = mockUser;
    expectedResponse.role = Role.SuperUser;
    authServiceMock.user = expectedResponse;

    expect(component.isSuperAdmin()).toEqual(true);
  });
});
