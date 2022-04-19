import { ComponentFixture, TestBed } from '@angular/core/testing';
import { AuthService } from 'app/core/auth/auth.service';
import { PasswordPopupComponent } from './password-popup.component';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { RouterTestingModule } from '@angular/router/testing';
import { BsModalService } from 'ngx-bootstrap/modal';
import { FormBuilder, Validators } from '@angular/forms';
import { mockUser } from 'app/core/auction/spec-files/mocked';
import { of } from 'rxjs';

describe('PasswordPopupComponent', () => {
  let component: PasswordPopupComponent;
  let fixture: ComponentFixture<PasswordPopupComponent>;
  const authServiceMock = jasmine.createSpyObj('AuthService', ['user', 'updatePassword']);
  authServiceMock.user = mockUser;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [PasswordPopupComponent],
      imports: [HttpClientTestingModule, RouterTestingModule],
      providers: [{ provide: AuthService, useValue: authServiceMock }, { provide: BsModalService }, { provide: FormBuilder }]
    }).compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(PasswordPopupComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should get user successfully', () => {
    const response = component.getUser();

    expect(response).toEqual(mockUser);
  });

  it('should update the form when password value changes', () => {
    const event = {
      target: {
        value: 'test'
      }
    };

    component.onChange(event);

    expect(component.updatePasswordForm.value.password).toEqual(event.target.value);
  });

  it('should update the password variable', () => {
    const event = {
      target: {
        value: 'test'
      }
    };

    component.onUpdate(event);

    expect(component.cpassword).toEqual(event.target.value);
  });

  describe('updatePassword', () => {
    it('should update the passsword sucessfully', () => {
      authServiceMock.updatePassword.and.returnValue(of());
      component.updatePasswordForm.controls['password'].setValue('test');
      component.cpassword = 'test';

      component.updatePassword();

      expect(component.errorMsg).toBe(false);
      expect(component.errorMsg1).toBe(false);
      expect(authServiceMock.updatePassword).toHaveBeenCalled();
    });

    it('should respond with error if one of passwords is not present', () => {
      component.updatePasswordForm.controls['password'].setValue('test');

      component.updatePassword();

      expect(component.errorMsg).toBe(false);
      expect(component.errorMsg1).toBe(true);
    });

    it('should respond with an error if both passwords dont match', () => {
      component.updatePasswordForm.controls['password'].setValue('test');
      component.cpassword = 'test1';

      component.updatePassword();

      expect(component.errorMsg).toBe(true);
      expect(component.errorMsg1).toBe(false);
    });
  });
});
