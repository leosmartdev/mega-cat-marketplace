import { ComponentFixture, TestBed } from '@angular/core/testing';
import { FormBuilder, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { SocialAuthService } from 'angularx-social-login';
import { AuthService } from 'app/core/auth/auth.service';
import { WalletService } from 'app/core/wallet/wallet.service';
import { RouteMonitorService } from 'app/shared/route-monitor.service';
import { of, throwError } from 'rxjs';
import firebase from 'firebase/compat/app';

import { SignInComponent } from './sign-in.component';

describe('SignInComponent', () => {
  let component: SignInComponent;
  let fixture: ComponentFixture<SignInComponent>;
  const firebaseUserCredentials = {
    additionalUserInfo: {},
    user: { getIdTokenResult: () => ({ token: 'FAKET0K3N' }) }
  } as unknown as firebase.auth.UserCredential;
  const activatedRouteMock = jasmine.createSpyObj('ActivatedRoute', ['snapshot']);
  const authServiceMock = jasmine.createSpyObj('AuthService', ['lookupEmail', 'firebaseSignInWithGoogle', 'saveUserUsingJWTGoogle', 'signIn', 'firebaseSignIn']);
  const walletServiceMock = jasmine.createSpyObj('WalletService', ['currentAccount']);
  const routerMock = jasmine.createSpyObj('Router', ['navigateByUrl', 'navigate']);
  const socialAuthServiceMock = jasmine.createSpyObj('SocialAuthService', ['']);
  const routeMonitorServiceMock = jasmine.createSpyObj('RouteMonitorService', ['getPreviousUrl']);
  routeMonitorServiceMock.getPreviousUrl.and.returnValue('test url');

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [FormsModule, ReactiveFormsModule],
      declarations: [SignInComponent],
      providers: [
        { provide: ActivatedRoute, useValue: activatedRouteMock },
        { provide: WalletService, useValue: walletServiceMock },
        { provide: AuthService, useValue: authServiceMock },
        { provide: FormBuilder },
        { provide: Router, useValue: routerMock },
        { provide: SocialAuthService, useValue: socialAuthServiceMock },
        { provide: RouteMonitorService, useValue: routeMonitorServiceMock }
      ]
    }).compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(SignInComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  afterEach(() => {
    fixture.destroy();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  describe('SignIn', () => {
    it('should sign in successfully with provided email', () => {
      const spyLogin = spyOn<any>(component, 'logInWithEmail');
      const testEmail = 'JohnDoe@test.com';
      const testPassword = '12345678';
      component.signInForm.controls['usernameOrEmail'].setValue(testEmail);
      component.signInForm.controls['password'].setValue(testPassword);

      component.signIn();

      expect(spyLogin).toHaveBeenCalledWith(testEmail, testPassword);
    });

    it('should return if sign in form is invalid', () => {
      component.signInForm.controls['password'].setValue(null);

      component.signIn();

      expect(component.signInForm.invalid).toBe(true);
    });

    it('should lookup for an email from username and sign in successfully', () => {
      const testUsername = 'JohnDoe123';
      const testPassword = '12345678';
      component.signInForm.controls['usernameOrEmail'].setValue(testUsername);
      component.signInForm.controls['password'].setValue(testPassword);
      const spyLogin = spyOn<any>(component, 'logInWithEmail');
      const spyLookup = spyOn<any>(component, 'lookupEmailFromUsername').and.callThrough();
      authServiceMock.lookupEmail.and.returnValue(of({ email: 'JohnDoe@test.com' }));

      component.signIn();

      expect(spyLogin).toHaveBeenCalledWith('JohnDoe@test.com', testPassword);
      expect(spyLookup).toHaveBeenCalledWith(testUsername);
    });

    it('should respond with an error alert if username is not registered', () => {
      const testUsername = 'JohnDoe123';
      const testPassword = '12345678';
      component.signInForm.controls['usernameOrEmail'].setValue(testUsername);
      component.signInForm.controls['password'].setValue(testPassword);
      const spyLookup = spyOn<any>(component, 'lookupEmailFromUsername').and.callThrough();
      authServiceMock.lookupEmail.and.returnValue(throwError({}));

      component.signIn();

      expect(component.showAlert).toBe(true);
      expect(component.alert.type).toEqual('error');
      expect(component.alert.message).toEqual('Username unavailable, Sign in with Email');
      expect(spyLookup).toHaveBeenCalledWith(testUsername);
    });
  });

  describe('SignInWithGoogle', () => {
    it('should sign in successfully', () => {
      routeMonitorServiceMock.getPreviousUrl.and.returnValue('/market');
      authServiceMock.firebaseSignInWithGoogle.and.returnValue(of(firebaseUserCredentials));
      authServiceMock.saveUserUsingJWTGoogle.and.returnValue(of({}));

      component.signInWithGoogle();

      expect(routerMock.navigateByUrl).toHaveBeenCalledWith('/market');
    });

    it('should respond with an error when failed to sign in', () => {
      authServiceMock.firebaseSignInWithGoogle.and.returnValue(throwError('Failed to sign in'));

      component.signInWithGoogle();

      expect(component.showAlert).toBe(true);
      expect(component.alert.type).toEqual('error');
      expect(component.alert.message).toEqual('Failed to sign in');
    });
  });

  describe('LoginWithEmail', () => {
    it('should login successfully and navigate to wallet connect ', () => {
      authServiceMock.firebaseSignIn.and.returnValue(of(firebaseUserCredentials));
      routeMonitorServiceMock.getPreviousUrl.and.returnValue('/market');
      authServiceMock.signIn.and.returnValue(of({}));
      walletServiceMock.currentAccount = null;

      (component as any).logInWithEmail('JohnDoe@test.com', '12345678');

      expect(routerMock.navigate).toHaveBeenCalledWith(['bookcoin/wallet-connect']);
    });

    it('should login successfully and navigate to market', () => {
      authServiceMock.firebaseSignIn.and.returnValue(of(firebaseUserCredentials));
      routeMonitorServiceMock.getPreviousUrl.and.returnValue('/market');
      authServiceMock.signIn.and.returnValue(of({}));
      walletServiceMock.currentAccount = 'test';

      (component as any).logInWithEmail('JohnDoe@test.com', '12345678');

      expect(routerMock.navigate).toHaveBeenCalledWith(['/market']);
    });

    it('should redirect to sign up page when failed to sign-in', () => {
      authServiceMock.firebaseSignIn.and.returnValue(of(firebaseUserCredentials));
      authServiceMock.signIn.and.returnValue(throwError('Failed to Sign In'));
      const email = 'JohnDoe@test.com';
      const password = '12345678';

      (component as any).logInWithEmail(email, password);

      expect(routerMock.navigate).toHaveBeenCalledWith(['sign-up-bkcn', { email, password }]);
    });

    it('should respond with an error if failed to sign in to firebase', () => {
      authServiceMock.firebaseSignIn.and.returnValue(throwError({ message: 'Failed to sign in' }));
      const email = 'JohnDoe@test.com';
      const password = '12345678';

      (component as any).logInWithEmail(email, password);

      expect(component.showAlert).toBe(true);
      expect(component.alert.type).toEqual('error');
      expect(component.alert.message).toEqual('Failed to sign in');
    });
  });
});
