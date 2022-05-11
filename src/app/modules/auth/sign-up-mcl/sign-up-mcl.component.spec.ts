import { ComponentFixture, TestBed } from '@angular/core/testing';
import { RouterTestingModule } from '@angular/router/testing';
import { SignUpMclComponent } from './sign-up-mcl.component';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { AngularFireAuthModule } from '@angular/fire/compat/auth';
import { AngularFireModule } from '@angular/fire/compat';
import { environment } from 'environments/environment';
import { ErrorsService } from 'app/core/errors/errors.service';
import { FormBuilder, NgForm } from '@angular/forms';
import { of, throwError } from 'rxjs';
import { AuthService } from 'app/core/auth/auth.service';
import { Router } from '@angular/router';
import { WalletService } from 'app/core/wallet/wallet.service';
describe('SignUpMclComponent', () => {
  let component: SignUpMclComponent;
  let fixture: ComponentFixture<SignUpMclComponent>;

  const errorsServiceMock = jasmine.createSpyObj('ErrorsService', ['openSnackBar']);
  const walletServiceMock = jasmine.createSpyObj('WalletService', ['getAccounts', 'currentAccount']);
  const authServiceMock = jasmine.createSpyObj('AuthService', ['firebaseSignUp', 'signUp']);
  // const routerMock = jasmine.createSpyObj('Router', ['navigate']);
  const fakeForm = {
    value: {
      name: 'Test',
      category: 'Sign Up'
    },
    resetForm: () => {}
  } as NgForm;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [SignUpMclComponent],
      imports: [RouterTestingModule, HttpClientTestingModule, AngularFireModule.initializeApp(environment.firebase), AngularFireAuthModule],
      providers: [
        { provide: FormBuilder },
        { provide: AuthService, useValue: authServiceMock },
        { provide: WalletService, useValue: walletServiceMock },
        // { provide: Router, useValue: routerMock },
        { provide: ErrorsService, useValue: errorsServiceMock }
      ]
    }).compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(SignUpMclComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
    component.signUpForm.controls['username'].setValue('johndoe123');
    component.signUpForm.controls['firstName'].setValue('John');
    component.signUpForm.controls['lastName'].setValue('Doe');
    component.signUpForm.controls['email'].setValue('JohnDoe@test.com');
    component.signUpForm.controls['password'].setValue('12345678');
    component.signUpForm.controls['company'].setValue('Some Company');
    component.signUpForm.controls['agreements'].setValue('true');
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  describe('Signup', () => {
    it('should sign up successfully and navigate to wallet connect', () => {
      const spyNavigate = spyOn((component as any)._router, 'navigate');
      authServiceMock.firebaseSignUp.and.returnValue(of({}));
      authServiceMock.signUp.and.returnValue(of('Signed in successfully'));
      walletServiceMock.currentAccount = null;

      component.signUp();

      expect(spyNavigate).toHaveBeenCalledWith(['profile/wallet']);
    });

    it('should sign up successfully and navigate to home page', () => {
      const spyNavigate = spyOn((component as any)._router, 'navigate');
      authServiceMock.firebaseSignUp.and.returnValue(of({}));
      authServiceMock.signUp.and.returnValue(of('Signed in successfully'));
      walletServiceMock.currentAccount = 'test';

      component.signUp();

      expect(spyNavigate).toHaveBeenCalledWith(['signed-in-redirect']);
    });

    it('should return if sign up form is invalid', () => {
      component.signUpForm.controls['email'].setValue(null);

      component.signUp();

      expect(component.signUpForm.invalid).toBe(true);
    });

    it('should respond with an error when failed to sign up', () => {
      authServiceMock.firebaseSignUp.and.returnValue(of({}));
      component.signUpNgForm = fakeForm;
      authServiceMock.signUp.and.returnValue(throwError('Some Error!'));

      component.signUp();

      expect(errorsServiceMock.openSnackBar).toHaveBeenCalledWith('Username or email already exists!', 'Error');
      expect(component.showAlert).toBe(true);
      expect(component.alert.type).toEqual('error');
      expect(component.alert.message).toEqual('Something went wrong, please try again.');
    });
  });

  it('should toggle the is agree check', () => {
    component.isAgree = false;

    component.termsCheck();

    expect(component.isAgree).toBe(true);
  });
});
