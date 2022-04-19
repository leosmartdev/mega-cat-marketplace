import { ComponentFixture, TestBed } from '@angular/core/testing';
import { AuthService } from 'app/core/auth/auth.service';
import { EmailPopupComponent } from './email-popup.component';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { RouterTestingModule } from '@angular/router/testing';
import { BsModalService } from 'ngx-bootstrap/modal';
import { FormBuilder, Validators } from '@angular/forms';
import { of } from 'rxjs';
import { mockUser } from 'app/core/auction/spec-files/mocked';

describe('EmailPopupComponent', () => {
  let component: EmailPopupComponent;
  let fixture: ComponentFixture<EmailPopupComponent>;
  const authServiceMock = jasmine.createSpyObj('AuthService', ['user', 'updateEmail']);
  authServiceMock.user = mockUser;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [EmailPopupComponent],
      imports: [HttpClientTestingModule, RouterTestingModule],
      providers: [{ provide: AuthService, useValue: authServiceMock }, { provide: BsModalService }, { provide: FormBuilder }]
    }).compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(EmailPopupComponent);
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

  it('should update the form when email value changes', () => {
    const event = {
      target: {
        value: 'johndoe@test.com'
      }
    };
    component.updateEmailForm = (component as any)._formBuilder.group({
      email: ['', Validators.required]
    });

    component.onChange(event);

    expect(component.updateEmailForm.value.email).toEqual(event.target.value);
  });

  it('should update the email', () => {
    component.updateEmailForm = (component as any)._formBuilder.group({
      email: ['', Validators.required]
    });
    component.updateEmailForm.controls['email'].setValue('johndoe@test.com');
    authServiceMock.updateEmail.and.returnValue(of());

    component.updateEmail();

    expect(authServiceMock.updateEmail).toHaveBeenCalledTimes(1);
  });
});
