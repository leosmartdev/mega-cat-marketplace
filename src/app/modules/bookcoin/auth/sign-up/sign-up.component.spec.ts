import { HttpClient } from '@angular/common/http';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { FormBuilder, NgForm } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from 'app/core/auth/auth.service';
import { ErrorsService } from 'app/core/errors/errors.service';
import { WalletService } from 'app/core/wallet/wallet.service';
import { from, of, throwError } from 'rxjs';

import { SignUpComponent } from './sign-up.component';

describe('SignUpComponent', () => {
  let component: SignUpComponent;
  let fixture: ComponentFixture<SignUpComponent>;
  const walletServiceMock = jasmine.createSpyObj('WalletService', ['getAccounts', 'currentAccount']);
  walletServiceMock.getAccounts.and.returnValue(from([]));
  const authServiceMock = jasmine.createSpyObj('AuthService', ['firebaseSignUp', 'signUp']);
  const errorsServiceMock = jasmine.createSpyObj('ErrorsService', ['openSnackBar']);
  const routerMock = jasmine.createSpyObj('Router', ['navigate']);
  const fakeForm = {
    value: {
      name: 'Test',
      category: 'Sign Up'
    },
    resetForm: () => {}
  } as NgForm;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [
        { provide: HttpClient },
        { provide: AuthService, useValue: authServiceMock },
        { provide: FormBuilder },
        { provide: Router, useValue: routerMock },
        { provide: ErrorsService, useValue: errorsServiceMock },
        { provide: WalletService, useValue: walletServiceMock }
      ],
      declarations: [SignUpComponent]
    }).compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(SignUpComponent);
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
      authServiceMock.firebaseSignUp.and.returnValue(of({}));
      authServiceMock.signUp.and.returnValue(of('Signed in successfully'));
      walletServiceMock.currentAccount = null;

      component.signUp();

      expect(routerMock.navigate).toHaveBeenCalledWith(['bookcoin/wallet-connect']);
    });

    it('should sign up successfully and navigate to home page', () => {
      authServiceMock.firebaseSignUp.and.returnValue(of({}));
      authServiceMock.signUp.and.returnValue(of('Signed in successfully'));
      walletServiceMock.currentAccount = 'test';

      component.signUp();

      expect(routerMock.navigate).toHaveBeenCalledWith(['signed-in-redirect']);
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

    it('should respond with an error when firebase sign up fails', () => {
      authServiceMock.firebaseSignUp.and.returnValue(throwError('Some Error!'));
      component.signUpNgForm = fakeForm;

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
