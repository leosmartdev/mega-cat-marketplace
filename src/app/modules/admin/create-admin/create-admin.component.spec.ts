import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ReactiveFormsModule } from '@angular/forms';
import { CreateAdminComponent } from './create-admin.component';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { HttpClientModule } from '@angular/common/http';
import { RouterTestingModule } from '@angular/router/testing';
import { AngularFireAuthModule } from '@angular/fire/compat/auth';
import { AngularFireModule } from '@angular/fire/compat';
import { environment } from 'environments/environment';
import { of } from 'rxjs';
import { AuthService } from 'app/core/auth/auth.service';
import { Role } from 'app/core/models/role';
import { mockUser } from 'app/core/auction/spec-files/mocked';
import { NgxPaginationModule } from 'ngx-pagination';
import { RolesService } from 'app/core/roles/roles.service';
describe('CreateAdminComponent', () => {
  let component: CreateAdminComponent;
  let fixture: ComponentFixture<CreateAdminComponent>;
  let httpMock: HttpTestingController;

  const authServiceMock = jasmine.createSpyObj('AuthService', ['user', 'check']);
  const rolesServiceMock = jasmine.createSpyObj('RolesService', ['makeAdmin', 'listUsers']);

  authServiceMock.check.and.returnValue(of(true));

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [CreateAdminComponent],
      imports: [
        ReactiveFormsModule,
        HttpClientModule,
        HttpClientTestingModule,
        RouterTestingModule,
        AngularFireModule.initializeApp(environment.firebase),
        AngularFireAuthModule,
        NgxPaginationModule
      ],
      providers: [
        { provide: AuthService, useValue: authServiceMock },
        { provide: RolesService, useValue: rolesServiceMock }
      ]
    }).compileComponents();
    httpMock = TestBed.get(HttpTestingController);
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(CreateAdminComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should return true', () => {
    const expectedResponse = mockUser;
    expectedResponse.role = Role.SuperUser;
    authServiceMock.user = expectedResponse;

    expect(component.isSuperAdmin()).toEqual(true);
  });

  it('should make a user an Admin', () => {
    rolesServiceMock.makeAdmin.and.returnValue(of(mockUser));
    const spyNavigate = spyOn((component as any)._router, 'navigateByUrl');

    component.makeAdmin(mockUser.email);

    expect(rolesServiceMock.makeAdmin).toHaveBeenCalledTimes(1);
    expect(spyNavigate).toHaveBeenCalledWith('/dashboard');
  });

  it('should search users using roles service', () => {
    component.createAdminForm.value.username = 'testUser@123';
    rolesServiceMock.listUsers.and.returnValue(of({ users: [mockUser] }));

    component.searchUsers();

    expect(component.users.length).toEqual(1);
    expect(component.users[0]).toEqual(mockUser);
  });
});
