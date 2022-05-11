import { fakeAsync, TestBed, tick } from '@angular/core/testing';
import { HttpClient } from '@angular/common/http';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { AuthService } from './auth.service';
import { environment } from 'environments/environment';
import { UserService } from '../user/user.service';
import { AngularFireAuth, AngularFireAuthModule } from '@angular/fire/compat/auth';
import firebase from 'firebase/compat/app';
import { AngularFireModule } from '@angular/fire/compat';
import { User } from '../user/user.types';
import { Role } from '../models/role';
import { mockUser } from '../auction/spec-files/mocked';

const baseUrl = environment.apiUrl;

describe('AuthService', () => {
  let service: AuthService;
  let httpClient: HttpClient;
  let httpTestingController: HttpTestingController;
  let spyAngularFireAuth: jasmine.SpyObj<AngularFireAuth>;

  const credentialsPayload = {
    email: 'test@gmail.com',
    password: 'test123'
  };

  beforeEach(() => {
    let store = {};
    const mockLocalStorage = {
      getItem: (key: string): string => (key in store ? store[key] : null),
      setItem: (key: string, value: string) => {
        store[key] = `${value}`;
      },
      removeItem: (key: string) => {
        delete store[key];
      },
      clear: () => {
        store = {};
      }
    };

    spyOn(localStorage, 'getItem').and.callFake(mockLocalStorage.getItem);
    spyOn(localStorage, 'setItem').and.callFake(mockLocalStorage.setItem);
    spyOn(localStorage, 'removeItem').and.callFake(mockLocalStorage.removeItem);
    spyOn(localStorage, 'clear').and.callFake(mockLocalStorage.clear);

    spyAngularFireAuth = jasmine.createSpyObj('AngularFireAuth', [
      'createUserWithEmailAndPassword',
      'signInWithEmailAndPassword',
      'signInWithPopup',
      'signOut',
      'isValidCachedToken'
    ]);

    TestBed.configureTestingModule({
      imports: [AngularFireModule.initializeApp(environment.firebase), AngularFireAuthModule, HttpClientTestingModule],
      providers: [{ provide: HttpClient }, { provide: UserService }, { provide: AngularFireAuth, useValue: spyAngularFireAuth }]
    });

    service = TestBed.inject(AuthService);
    localStorage.setItem('user', JSON.stringify(mockUser));
    httpClient = TestBed.inject(HttpClient);
    httpTestingController = TestBed.inject(HttpTestingController);
  });

  it('should create the service', () => {
    expect(service).toBeTruthy();
  });

  describe('Access Token', () => {
    it('should get the token from localStorage', () => {
      const accessToken = 'ACC3SST0K3N';
      localStorage.setItem('accessToken', accessToken);
      const spyGet = spyOnProperty(service, 'accessToken', 'get').and.callThrough();

      expect(service.accessToken).toEqual(accessToken);

      expect(spyGet).toHaveBeenCalledTimes(1);
    });
  });

  describe('avatar', () => {
    it('should update avatar correctly', () => {
      const url = `${baseUrl}/user/updateAvatar`;
      const expectedResponse = {
        user: { avatar: 'new_avatar.png' }
      };

      const data = new FormData();
      data.append('avatar', 'profile.png');

      service.updateAvatar(data).subscribe((res) => expect(res).toEqual(expectedResponse));

      const requestWrapper = httpTestingController.expectOne({ url });
      expect(requestWrapper.request.method).toEqual('POST');
      requestWrapper.flush(expectedResponse);
      httpTestingController.verify();
    });

    it('should throw error if avatar is not present', () => {
      const data = new FormData();
      data.append('file', 'profile.png');

      expect(() => service.updateAvatar(data).subscribe()).toThrowError('avatar is not present');
    });

    it('should remove avatar correctly', () => {
      const url = `${baseUrl}/user/removeAvatar`;
      const expectedResponse = {
        user: { avatar: null }
      };

      service.removeAvatar().subscribe((data) => expect(data).toEqual(expectedResponse));

      const requestWrapper = httpTestingController.expectOne({ url });
      expect(requestWrapper.request.method).toEqual('POST');
      requestWrapper.flush(expectedResponse);
      httpTestingController.verify();
    });
  });

  describe('email', () => {
    it('should update email correctly', () => {
      const url = `${baseUrl}/user/updateEmail`;
      const email = 'new@email.com';
      const expectedResponse = { user: { email } };

      const data = new FormData();
      data.append('email', email);

      service.updateEmail(data).subscribe((res) => expect(res).toEqual(expectedResponse));

      const requestWrapper = httpTestingController.expectOne({ url });
      expect(requestWrapper.request.method).toEqual('POST');
      requestWrapper.flush(expectedResponse);
      httpTestingController.verify();
    });

    it('should throw error if email is not present', () => {
      const data = new FormData();

      expect(() => service.updateEmail(data).subscribe()).toThrowError('email is not present');
    });
  });

  describe('password', () => {
    it('should send forgot password link correctly', () => {
      const url = `${baseUrl}/api/auth/forgot-password`;
      const expectedResponse = { message: 'link send successfully' };
      const email = 'test@gmail.com';

      service.forgotPassword(email).subscribe((data) => expect(data).toEqual(expectedResponse));

      const requestWrapper = httpTestingController.expectOne({ url });
      expect(requestWrapper.request.method).toEqual('POST');
      requestWrapper.flush(expectedResponse);
      httpTestingController.verify();
    });

    it('should update password correctly', () => {
      const url = `${baseUrl}/user/updatePassword`;
      const expectedResponse = { token: 'sometoken' };

      const data = new FormData();
      data.append('password', 'S3CR3TP4SSW0RD');

      service.updatePassword(data).subscribe((res) => expect(res).toEqual(expectedResponse));

      const requestWrapper = httpTestingController.expectOne({ url });
      expect(requestWrapper.request.method).toEqual('POST');
      requestWrapper.flush(expectedResponse);
      httpTestingController.verify();
    });

    it('should send reset password correctly', () => {
      const url = `${baseUrl}/api/auth/reset-password`;
      const expectedResponse = { user: 'auth' };
      const password = 'newPassword';

      service.resetPassword(password).subscribe((data) => expect(data).toEqual(expectedResponse));

      const requestWrapper = httpTestingController.expectOne({ url });
      expect(requestWrapper.request.method).toEqual('POST');
      requestWrapper.flush(expectedResponse);
      httpTestingController.verify();
    });

    it('should throw error if email is not present', () => {
      expect(() => service.forgotPassword('').subscribe()).toThrowError('email is not present');
    });

    it('should throw error if password is not present', () => {
      const data = new FormData();

      expect(() => service.updatePassword(data).subscribe()).toThrowError('password is not present');

      expect(() => service.resetPassword('').subscribe()).toThrowError('password is not present');
    });
  });

  describe('lookupEmail', () => {
    it('should get email correctly', () => {
      const url = `${baseUrl}/auth/lookupEmail/`;
      const expectedResponse = { email: 'fakeUs3rN4M3@test.com' };

      const fakeUsername = 'fakeUs3rN4M3';

      service.lookupEmail(fakeUsername).subscribe((res) => expect(res).toEqual(expectedResponse));

      const requestWrapper = httpTestingController.expectOne({ url });
      expect(requestWrapper.request.method).toEqual('POST');
      requestWrapper.flush(expectedResponse);
      httpTestingController.verify();
    });

    it('should invoke error callback when email not found', () => {
      const url = `${baseUrl}/auth/lookupEmail/`;
      const expectedError = {
        status: 400,
        statusText: 'No Matching email found'
      };

      const fakeUsername = 'fakeUs3rN4M3';

      service.lookupEmail(fakeUsername).subscribe(
        () => fail('expected an error, not user credentials'),
        (error) => {
          expect(error).toEqual(jasmine.objectContaining(expectedError));
        }
      );

      const requestWrapper = httpTestingController.expectOne({ url });
      expect(requestWrapper.request.method).toEqual('POST');
      requestWrapper.flush(null, expectedError);
      httpTestingController.verify();
    });
  });

  describe('saveUserUsingJWTGoogle', () => {
    it('should save user correctly', () => {
      const url = `${baseUrl}/auth/loginWithJwt/`;
      const expectedResponse = { user: { role: 1 } };

      const fakeToken = 'fakeT0K3N';

      service.saveUserUsingJWTGoogle(fakeToken).subscribe((res) => expect(res).toEqual(expectedResponse));

      const requestWrapper = httpTestingController.expectOne({ url });
      expect(requestWrapper.request.method).toEqual('POST');
      requestWrapper.flush(expectedResponse);
      httpTestingController.verify();
    });

    it('should throw error if token is not present', () => {
      expect(() => service.saveUserUsingJWTGoogle('').subscribe()).toThrowError('token is not present');
    });
  });

  describe('Firebase', () => {
    const firebaseUserCredentials = {
      additionalUserInfo: {},
      user: { getIdTokenResult: () => ({ token: 'FAKET0K3N' }) }
    } as unknown as firebase.auth.UserCredential;

    describe('Sign Up', () => {
      it('should perform register correctly', (done) => {
        spyAngularFireAuth.createUserWithEmailAndPassword.and.returnValue(Promise.resolve(firebaseUserCredentials));

        service.firebaseSignUp(credentialsPayload).subscribe((res) => {
          expect(res).toEqual(firebaseUserCredentials.user);
          done();
        });
      });

      it('should throw error if email is not present', () => {
        expect(() => service.firebaseSignUp({ email: '', password: 'password' }).subscribe()).toThrowError('email is not present');
      });

      it('should throw error if password is not present', () => {
        expect(() => service.firebaseSignUp({ email: 'email@test.com', password: '' }).subscribe()).toThrowError('password is not present');
      });

      it('should invoke error callback when failed to signup with firebase', (done) => {
        const errorMessage = 'Unable to proceed';
        spyAngularFireAuth.createUserWithEmailAndPassword.and.returnValue(Promise.reject(errorMessage));

        service.firebaseSignUp(credentialsPayload).subscribe(
          () => fail('expected an error, not user credentials'),
          (error) => {
            expect(error).toEqual(errorMessage);
            done();
          }
        );
      });
    });

    describe('Sign In', () => {
      it('should perform login correctly', fakeAsync(() => {
        spyAngularFireAuth.signInWithEmailAndPassword.and.returnValue(Promise.resolve(firebaseUserCredentials));

        service.firebaseSignIn(credentialsPayload).subscribe(
          (res) => expect(res).toEqual(firebaseUserCredentials),
          () => fail('expected to have user credentials')
        );
      }));

      it('should throw error if email is not present', () => {
        expect(() => service.firebaseSignIn({ email: '', password: 'password' }).subscribe()).toThrowError('email is not present');
      });

      it('should throw error if password is not present', () => {
        expect(() => service.firebaseSignIn({ email: 'email@test.com', password: '' }).subscribe()).toThrowError('password is not present');
      });

      it('should invoke error callback when failed to signin with firebase', (done) => {
        const errorMessage = 'Unable to proceed';
        spyAngularFireAuth.signInWithEmailAndPassword.and.returnValue(Promise.reject(errorMessage));

        service.firebaseSignIn(credentialsPayload).subscribe(
          () => fail('expected an error, not user credentials'),
          (error) => {
            expect(error).toEqual(errorMessage);
            done();
          }
        );
      });
    });

    describe('Sign In - Google', () => {
      it('should perform register correctly', (done) => {
        spyOn<any>(service, 'getFireAuthProvider').and.returnValue({});

        spyAngularFireAuth.signInWithPopup.and.callFake(() => {
          (service as any)._authenticated = true;
          return Promise.resolve(firebaseUserCredentials);
        });

        service.firebaseSignInWithGoogle().subscribe(
          (res) => {
            expect(res).toEqual(firebaseUserCredentials);

            // should return fail, as it's already logged in .
            service.firebaseSignInWithGoogle().subscribe(
              () => fail('expected an error, not user credentials'),
              (err) => {
                expect(err).toEqual('User is already logged in.');
                done();
              }
            );
          },
          () => fail('expected to have user credentials')
        );
      });

      it('should invoke error callback when failed to signin with firebase', (done) => {
        const errorMessage = 'Unable to proceed';

        spyOn<any>(service, 'getFireAuthProvider').and.returnValue({});

        spyAngularFireAuth.signInWithPopup.and.returnValue(Promise.reject(errorMessage));

        service.firebaseSignInWithGoogle().subscribe(
          () => fail('expected an error, not user credentials'),
          (error) => {
            expect(error).toEqual(errorMessage);
            done();
          }
        );
      });
    });

    describe('Sign Out', () => {
      it('should perform logout correctly', (done) => {
        spyAngularFireAuth.signOut.and.returnValue(Promise.resolve());

        service.firebaseSignOut().subscribe((res) => {
          expect(res).toBe(undefined);
          done();
        });
      });

      it('should invoke error callback when crashed', (done) => {
        const errorMessage = 'Unable to proceed';
        spyAngularFireAuth.signOut.and.returnValue(Promise.reject(errorMessage));

        service.firebaseSignOut().subscribe(
          () => fail('expected an error, not user credentials'),
          (error) => {
            expect(error).toEqual(errorMessage);
            done();
          }
        );
      });
    });
  });

  describe('Sign In', () => {
    it('should perform login correctly', () => {
      const url = `${baseUrl}/auth/loginUserFirebase/`;
      const expectedResponse = {
        user: mockUser,
        token: 'anothertoken'
      };

      service.signIn('test@test.com', 'z33km2kdgjgkd').subscribe((data) => expect(data).toEqual(expectedResponse));

      const requestWrapper = httpTestingController.expectOne({ url });
      expect(requestWrapper.request.method).toEqual('POST');
      requestWrapper.flush(expectedResponse);
      httpTestingController.verify();
    });
  });

  describe('Sign Out', () => {
    it('should perform logout correctly', () => {
      service.signOut().subscribe((data) => expect(data).toEqual(true));
    });

    it('should perform logout correctly when user is of type firebase', (done) => {
      const spyFirebase = spyOn(service, 'firebaseSignOut').and.resolveTo();

      localStorage.setItem('user', JSON.stringify({ ...service.user, isFirebaseUser: true }));

      service.signOut().subscribe((data) => {
        expect(data).toEqual(true);
        expect(spyFirebase).toHaveBeenCalledTimes(1);
        done();
      });
    });
  });

  describe('Sign Up', () => {
    it('should perform register correctly', () => {
      const url = `${baseUrl}/auth/createUserFirebase/`;
      const expectedResponse = {
        user: { ...mockUser, role: 0 }
      };
      const data = {
        userName: 'test',
        firstName: 'test1',
        lastName: 'test2',
        email: 'test@gmail.com',
        password: 'test123'
      };

      service.signUp(data).subscribe((res) => expect(res).toEqual(expectedResponse));

      const requestWrapper = httpTestingController.expectOne({ url });
      expect(requestWrapper.request.method).toEqual('POST');
      requestWrapper.flush(expectedResponse);
      httpTestingController.verify();
    });
  });

  describe('unlockSession', () => {
    it('should send reset password link correctly', () => {
      const url = `${baseUrl}/api/auth/unlock-session`;
      const expectedResponse = {};

      service.unlockSession(credentialsPayload).subscribe((data) => expect(data).toEqual(expectedResponse));

      const requestWrapper = httpTestingController.expectOne({ url });
      expect(requestWrapper.request.method).toEqual('POST');
      requestWrapper.flush(expectedResponse);
      httpTestingController.verify();
    });

    it('should throw error if email is not present', () => {
      expect(() => service.unlockSession({ email: '', password: 'password' }).subscribe()).toThrowError('email is not present');
    });

    it('should throw error if password is not present', () => {
      expect(() => service.unlockSession({ email: 'email@test.com', password: '' }).subscribe()).toThrowError('password is not present');
    });
  });

  describe('check', () => {
    it('should return false for invalid access token', () => {
      service.check().subscribe((data) => expect(data).toEqual(false));
    });

    it('should signIn using valid access token', (done) => {
      const url = `${baseUrl}/api/auth/refresh-access-token/`;
      spyOn<any>(service, 'isValidCachedToken').and.returnValue(true);

      service.check().subscribe(
        (data) => {
          expect(data).toEqual(true);

          // should return true immediately
          service.check().subscribe((_data) => {
            expect(_data).toEqual(true);
            done();
          });
        },
        () => fail('expected to resolve successfully')
      );

      const requestWrapper = httpTestingController.expectOne({ url });
      expect(requestWrapper.request.method).toEqual('POST');
      requestWrapper.flush({});
      httpTestingController.verify();
    });

    it('should fail while signIn using valid access token', () => {
      const url = `${baseUrl}/api/auth/refresh-access-token/`;
      spyOn<any>(service, 'isValidCachedToken').and.returnValue(true);

      service.check().subscribe(
        (data) => expect(data).toEqual(false),
        () => fail('expected to resolve successfully')
      );

      const requestWrapper = httpTestingController.expectOne({ url });
      expect(requestWrapper.request.method).toEqual('POST');
      requestWrapper.flush(null, {
        status: 500,
        statusText: 'Internal Server Error'
      });
      httpTestingController.verify();
    });

    it('should fail when firebaseUser has no reload function', () => {
      localStorage.setItem('user', JSON.stringify({ isFirebaseUser: true, firebaseUser: {} } as User));
      spyOn<any>(service, 'isValidCachedToken').and.returnValue(true);

      service.check().subscribe(
        (data) => expect(data).toEqual(false),
        () => fail('expected to resolve successfully')
      );
    });
  });

  describe('user role', () => {
    it('should return true for admin role', () => {
      localStorage.setItem('user', JSON.stringify({ role: Role.Admin } as User));

      expect(service.isAdmin()).toBeTrue();
    });

    it('should return true for admin role if SuperUser is true', () => {
      localStorage.setItem('user', JSON.stringify({ role: Role.SuperUser } as User));

      expect(service.isAdmin()).toBeTrue();
    });

    it('should return true for super admin role', () => {
      localStorage.setItem('user', JSON.stringify({ role: Role.SuperUser } as User));

      expect(service.isSuperAdmin()).toBeTrue();
    });
  });

  it('should update the role for super admin and set username and banner', () => {
    const user = JSON.parse(JSON.stringify(mockUser));
    user.role = 2;
    const response = {
      user,
      token: 'ACC3SST0K3N',
      refreshToken: 'R3FR3SHT0K3N'
    };

    (service as any).updateRoleAndAuth(response);

    expect(service.accessToken).toEqual(response.token);
    expect(service.refreshToken).toEqual(response.refreshToken);
  });

  it('should refresh the access token', () => {
    const url = `${baseUrl}/auth/refreshToken`;
    const spyAccess = spyOn<any>(service, 'setAccessToken');
    const spyRefresh = spyOn<any>(service, 'setRefreshToken');
    const expectedResponse = {
      refreshToken: 'R3FR3SHT0K3N',
      accessToken: 'NEWACC3SST0K3N'
    };

    service.refreshTokens().subscribe((res) => {
      expect(res).toEqual(expectedResponse);
    });

    const requestWrapper = httpTestingController.expectOne({ url });
    expect(requestWrapper.request.method).toEqual('POST');
    requestWrapper.flush(expectedResponse);
    expect(spyAccess).toHaveBeenCalledWith(expectedResponse.accessToken);
    expect(spyRefresh).toHaveBeenCalledWith(expectedResponse.refreshToken);
    httpTestingController.verify();
  });

  it('should update the profile of user', () => {
    const url = `${baseUrl}/user/updateProfile`;
    const spyUser = spyOn<any>(service, 'setUser');
    const expectedResponse = { user: mockUser };

    service.updateProfile({ avatar: 'test', bio: 'test' }).subscribe((res) => {
      expect(res).toEqual(expectedResponse);
    });

    const requestWrapper = httpTestingController.expectOne({ url });
    expect(requestWrapper.request.method).toEqual('POST');
    requestWrapper.flush(expectedResponse);
    expect(service.user.avatar).toEqual(mockUser.avatar);
    expect(service.user.bio).toEqual(mockUser.bio);
    httpTestingController.verify();
  });

  it('should update the banner of user', () => {
    const url = `${baseUrl}/user/updateBanner`;
    spyOn<any>(service, 'setUser');
    const expectedResponse = { user: mockUser };

    service.updateBanner({ banner: 'test banner' }).subscribe((res) => {
      expect(res).toEqual(expectedResponse);
    });

    const requestWrapper = httpTestingController.expectOne({ url });
    expect(requestWrapper.request.method).toEqual('POST');
    requestWrapper.flush(expectedResponse);
    expect(service.user.banner).toEqual(mockUser.banner);
    httpTestingController.verify();
  });

  describe('WalletAddresses', () => {
    it('should update wallet addresses', () => {
      const data = new FormData();
      (service as any).setUser(mockUser);
      const url = `${baseUrl}/user/updateWalletAddresses`;

      const expectedResponse = { walletAddresses: mockUser.walletAddresses };

      service.updateWalletAddresses(data).subscribe((res) => {
        expect(res).toEqual(expectedResponse);
      });

      const requestWrapper = httpTestingController.expectOne({ url });
      expect(requestWrapper.request.method).toEqual('POST');
      requestWrapper.flush(expectedResponse);
      expect(service.user.walletAddresses).toEqual(mockUser.walletAddresses);
      httpTestingController.verify();
    });

    it('should update linked wallet addresses', () => {
      const data = new FormData();
      (service as any).setUser(mockUser);
      const url = `${baseUrl}/user/updateLinkedWalletAddresses`;

      const expectedResponse = { linkedWalletAddresses: mockUser.linkedWalletAddresses };

      service.updateLinkedWalletAddresses(data).subscribe((res) => {
        expect(res).toEqual(expectedResponse);
      });

      const requestWrapper = httpTestingController.expectOne({ url });
      expect(requestWrapper.request.method).toEqual('POST');
      requestWrapper.flush(expectedResponse);
      expect(service.user.linkedWalletAddresses).toEqual(mockUser.linkedWalletAddresses);
      httpTestingController.verify();
    });

    it('should delete wallet addresses', () => {
      const data = new FormData();
      (service as any).setUser(mockUser);
      const url = `${baseUrl}/user/deleteWalletAddresses`;

      const expectedResponse = { walletAddresses: mockUser.walletAddresses };

      service.deleteWalletAddresses(data).subscribe((res) => {
        expect(res).toEqual(expectedResponse);
      });

      const requestWrapper = httpTestingController.expectOne({ url });
      expect(requestWrapper.request.method).toEqual('POST');
      requestWrapper.flush(expectedResponse);
      expect(service.user.walletAddresses).toEqual(mockUser.walletAddresses);
      httpTestingController.verify();
    });

    it('should update linked wallet addresses', () => {
      const data = new FormData();
      (service as any).setUser(mockUser);
      const url = `${baseUrl}/user/deleteLinkedWalletAddresses`;

      const expectedResponse = { linkedWalletAddresses: mockUser.linkedWalletAddresses };

      service.deleteLinkedWalletAddresses(data).subscribe((res) => {
        expect(res).toEqual(expectedResponse);
      });

      const requestWrapper = httpTestingController.expectOne({ url });
      expect(requestWrapper.request.method).toEqual('POST');
      requestWrapper.flush(expectedResponse);
      expect(service.user.linkedWalletAddresses).toEqual(mockUser.linkedWalletAddresses);
      httpTestingController.verify();
    });
  });
});
