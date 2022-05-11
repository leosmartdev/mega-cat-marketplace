import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, of, throwError } from 'rxjs';
import { catchError, switchMap } from 'rxjs/operators';
import { AuthUtils } from 'app/core/auth/auth.utils';
import { UserService } from 'app/core/user/user.service';
import { User, UserPayload } from '../user/user.types';
import { Role } from '../models/role';
import { AngularFireAuth } from '@angular/fire/compat/auth';
import firebase from 'firebase/compat/app';
import { environment } from 'environments/environment';
import IdTokenResult = firebase.auth.IdTokenResult;
import { FirebasePayload } from './auth.types';

const baseUrl = environment.apiUrl;

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private _authenticated: boolean = false;

  /**
   * Constructor
   */
  constructor(private httpClient: HttpClient, private userService: UserService, private fireAuth: AngularFireAuth) {
    this._authenticated = this.isValidCachedToken();
    if (this._authenticated) {
      // TODO: THIS CODE IS UNREACHABLE !!!
      this.userService.user = this.user;
    }
  }

  public getAuthHeader(): HttpHeaders {
    const token = this.accessToken;
    return new HttpHeaders().set('Authorization', `Bearer ${token}`);
  }

  // -----------------------------------------------------------------------------------------------------
  // @ Accessors
  // -----------------------------------------------------------------------------------------------------

  /**
   * Getter for access token
   */
  get accessToken(): string {
    return localStorage.getItem('accessToken') ?? '';
  }

  get refreshToken(): string {
    return localStorage.getItem('refreshToken') ?? '';
  }

  /**
   * Setter for user
   */
  set user(user: User) {
    localStorage.setItem('user', JSON.stringify(user));
  }
  /**
   * Getter for user
   */
  get user(): User {
    const user: User = JSON.parse(localStorage.getItem('user'));
    return user;
  }

  // -----------------------------------------------------------------------------------------------------
  // @ Public methods
  // -----------------------------------------------------------------------------------------------------

  /**
   * Exchange refresh token with new pair of access and refresh token
   */
  refreshTokens = () =>
    this.httpClient.post(`${baseUrl}/auth/refreshToken`, null, { headers: new HttpHeaders().set('Authorization', `Bearer ${this.refreshToken}`) }).pipe(
      switchMap((response: any) => {
        this.setAccessToken(response.accessToken);
        this.setRefreshToken(response.refreshToken);

        return of(response);
      })
    );

  /**
   * Update Avatar
   */
  updateAvatar(formData: FormData): Observable<any> {
    if (!formData.has('avatar')) {
      throw new Error('avatar is not present');
    }

    return this.httpClient.post(`${baseUrl}/user/updateAvatar`, formData, { headers: this.getAuthHeader() }).pipe(
      switchMap((response: any) => {
        const user = this.user;
        user.avatar = response.user.avatar;
        this.setUser(user);
        return of(response);
      })
    );
  }

  /**
   * Update Banner
   */
  updateBanner(data): Observable<any> {
    return this.httpClient.post(`${baseUrl}/user/updateBanner`, data, { headers: this.getAuthHeader() }).pipe(
      switchMap((response: any) => {
        const that = this.user;
        that.banner = response.banner;
        this.setUser(that);
        return of(response);
      })
    );
  }

  /**
   * Update Wallet Addresses
   */
  updateWalletAddresses(data: FormData): Observable<any> {
    return this.httpClient.post(`${baseUrl}/user/updateWalletAddresses`, data, { headers: this.getAuthHeader() }).pipe(
      switchMap((response: any) => {
        const that = this.user;
        that.walletAddresses = response.walletAddresses;
        this.setUser(that);
        return of(response);
      })
    );
  }

  /**
   * Update Linked Wallet Addresses
   */
  updateLinkedWalletAddresses(data: FormData): Observable<any> {
    return this.httpClient.post(`${baseUrl}/user/updateLinkedWalletAddresses`, data, { headers: this.getAuthHeader() }).pipe(
      switchMap((response: any) => {
        const that = this.user;
        that.linkedWalletAddresses = response.linkedWalletAddresses;
        this.setUser(that);
        return of(response);
      })
    );
  }

  /**
   * Update Linked Wallet Addresses
   */
  deleteLinkedWalletAddresses(data: FormData): Observable<any> {
    return this.httpClient.post(`${baseUrl}/user/deleteLinkedWalletAddresses`, data, { headers: this.getAuthHeader() }).pipe(
      switchMap((response: any) => {
        const that = this.user;
        that.linkedWalletAddresses = response.linkedWalletAddresses;
        this.setUser(that);
        return of(response);
      })
    );
  }

  /**
   * Update Linked Wallet Addresses
   */
  deleteWalletAddresses(data: FormData): Observable<any> {
    return this.httpClient.post(`${baseUrl}/user/deleteWalletAddresses`, data, { headers: this.getAuthHeader() }).pipe(
      switchMap((response: any) => {
        const that = this.user;
        that.walletAddresses = response.walletAddresses;
        this.setUser(that);
        return of(response);
      })
    );
  }

  /**
   * Update Profile
   */
  updateProfile(data): Observable<any> {
    return this.httpClient.post(`${baseUrl}/user/updateProfile`, data, { headers: this.getAuthHeader() }).pipe(
      switchMap((response: any) => {
        const that = this.user;
        that.avatar = response.user.avatar;
        that.bio = response.user.bio;
        this.setUser(that);
        return of(response);
      })
    );
  }

  /**
   * Remove Avatar
   */
  removeAvatar(): Observable<any> {
    return this.httpClient.post(`${baseUrl}/user/removeAvatar`, { headers: this.getAuthHeader() }).pipe(
      switchMap((response: any) => {
        const user = this.user;
        user.avatar = response.user.avatar;
        this.setUser(user);
        return of(response);
      })
    );
  }

  /**
   * Return default avatar
   */
  getDefaultAvatar(): string {
    return 'https://cdn.shopify.com/s/files/1/1494/4102/t/7/assets/pf-5005c27f--IWantYouUncleSam4.png?v=1593416331';
  }

  /**
   * Update Email
   */
  updateEmail(formData: FormData): Observable<any> {
    if (!formData.has('email')) {
      throw new Error('email is not present');
    }

    return this.httpClient.post(`${baseUrl}/user/updateEmail`, formData, { headers: this.getAuthHeader() }).pipe(
      switchMap((response: any) => {
        // Store the user in the local storage
        this.setUser(response.user);

        // Store the user on the user service
        this.userService.user = response.user;

        // Return a new observable with the response
        return of(response);
      })
    );
  }

  /**
   * Update Password
   */
  updatePassword(formData: FormData): Observable<any> {
    if (!formData.has('password')) {
      throw new Error('password is not present');
    }

    return this.httpClient.post(`${baseUrl}/user/updatePassword`, formData, { headers: this.getAuthHeader() });
  }

  /**
   * Forgot password
   *
   * @param email
   */
  forgotPassword(email: string) {
    if (!email) {
      throw new Error('email is not present');
    }

    return this.httpClient.post(`${baseUrl}/api/auth/forgot-password`, email);
  }

  /**
   * Reset password
   *
   * @param password
   */
  resetPassword(password: string) {
    if (!password) {
      throw new Error('password is not present');
    }

    return this.httpClient.post(`${baseUrl}/api/auth/reset-password`, password);
  }

  lookupEmail = (userName: string) => this.httpClient.post(`${baseUrl}/auth/lookupEmail/`, { userName }).pipe(switchMap((response: { email: string }) => of(response)));

  /**
   * Firebase sign up with email and password
   *
   * @param email
   * @param password
   */
  firebaseSignUp({ email, password }: FirebasePayload): Observable<firebase.User> {
    if (!email) {
      throw new Error('email is not present');
    }
    if (!password) {
      throw new Error('password is not present');
    }

    return new Observable<firebase.User>((subscriber) => {
      this.fireAuth
        .createUserWithEmailAndPassword(email, password)
        .then(async (result: firebase.auth.UserCredential) => {
          const user = await this.mapFirebaseUserCredentialsToUser(result);
          this.updateUserInformation(user);
          subscriber.next(result.user);
        })
        .catch((error) => subscriber.error(error));
    });
  }

  /**
   * Firebase sign in with email and password
   *
   * @param email
   * @param password
   */
  firebaseSignIn({ email, password }: FirebasePayload): Observable<firebase.auth.UserCredential> {
    if (!email) {
      throw new Error('email is not present');
    }
    if (!password) {
      throw new Error('password is not present');
    }

    return new Observable((subscriber) => {
      this.fireAuth
        .signInWithEmailAndPassword(email, password)
        .then(async (userCredential: firebase.auth.UserCredential) => {
          const user = await this.mapFirebaseUserCredentialsToUser(userCredential);
          this.updateUserInformation(user);
          subscriber.next(userCredential);
        })
        .catch((error) => subscriber.error(error));
    });
  }

  /**
   * Sign in with Google SSO
   *
   * @param socialUser
   */
  firebaseSignInWithGoogle(): Observable<firebase.auth.UserCredential> {
    if (this._authenticated) {
      return throwError('User is already logged in.');
    }

    return new Observable((subscriber) => {
      this.fireAuth
        .signInWithPopup(this.getFireAuthProvider())
        .then(async (userCredential: firebase.auth.UserCredential) => {
          const user = await this.mapFirebaseUserCredentialsToUser(userCredential);
          this.updateUserInformation(user);

          subscriber.next(userCredential);
        })
        .catch((error) => subscriber.error(error));
    });
  }

  firebaseSignOut = (): Observable<void> =>
    new Observable((subscriber) => {
      this.fireAuth
        .signOut()
        .then(() => subscriber.next())
        .catch((error) => subscriber.error(error));
    });

  saveUserUsingJWTGoogle = (idToken: string) => {
    if (!idToken) {
      throw new Error('token is not present');
    }

    return this.httpClient.post(`${baseUrl}/auth/loginWithJwt/`, { idToken }).pipe(
      switchMap((response: any) => {
        this.updateRoleAndAuth(response);
        return of(response);
      })
    );
  };

  /**
   * Sign in
   *
   * @param email - the email used to login with.
   */
  signIn = (email: string, uid: string) =>
    this.httpClient
      .post(`${baseUrl}/auth/loginUserFirebase/`, {
        email,
        uid
      })
      .pipe(
        switchMap((response: any) => {
          this.updateRoleAndAuth(response);
          return of(response);
        })
      );

  /**
   * Sign out
   */
  signOut(): Observable<boolean> {
    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');
    this._authenticated = false;

    if (this.user?.isFirebaseUser) {
      this.firebaseSignOut();
      this.setUser(null);
    }

    return of(true);
  }

  /**
   * Sign up
   *
   * @param user
   */
  signUp = (user: UserPayload): Observable<any> =>
    this.httpClient.post(`${baseUrl}/auth/createUserFirebase/`, user).pipe(
      switchMap((response: any) => {
        this.setUser(response.user);
        this.updateRoleAndAuth(response);
        return of(response);
      })
    );

  /**
   * Unlock session
   *
   * @param user
   */
  unlockSession({ email, password }: FirebasePayload) {
    if (!email) {
      throw new Error('email is not present');
    }
    if (!password) {
      throw new Error('password is not present');
    }

    return this.httpClient.post(`${baseUrl}/api/auth/unlock-session`, {
      email,
      password
    });
  }

  /**
   * Check the authentication status
   */
  check(): Observable<boolean> {
    // Check if the user is logged in
    if (this._authenticated) {
      return of(true);
    }

    if (!this.isValidCachedToken()) {
      return of(false);
    }

    // If the access token exists and it didn't expire, sign in using it
    if (this.user.isFirebaseUser) {
      if (this.user.firebaseUser.hasOwnProperty('reload')) {
        // TODO: THIS CODE IS UNREACHABLE !!!
        // this.user.firebaseUser.reload();
        // return of(true);
      }

      return of(false);
    } else {
      return this.signInUsingToken();
    }
  }

  isAdmin = () => {
    if (this.user && this.user.role) {
      return [Role.Admin, Role.SuperUser].includes(this.user.role);
    } else {
      return false;
    }
  };

  isSuperAdmin = () => Boolean(this.user) && this.user.role === Role.SuperUser;

  /**
   * Internal Setter for access token
   */
  private setAccessToken(token: string) {
    localStorage.setItem('accessToken', token);
  }

  private setRefreshToken(token: string) {
    localStorage.setItem('refreshToken', token);
  }
  /**
   * Internal Setter for user
   */
  private setUser(user: User) {
    localStorage.setItem('user', JSON.stringify(user));
  }

  /**
   * Sign in using the access token
   * Renew token
   */
  private signInUsingToken = (): Observable<boolean> =>
    this.httpClient
      .post(`${baseUrl}/api/auth/refresh-access-token/`, {
        accessToken: this.accessToken
      })
      .pipe(
        switchMap(() => {
          this.setAccessToken(this.accessToken);
          this.setRefreshToken(this.refreshToken);
          this._authenticated = true;
          this.userService.user = this.user;

          return of(true);
        }),
        catchError(() => of(false))
      );

  private updateRoleAndAuth(response: any) {
    const user = this.user;
    if (response.user.role === 0) {
      user.role = Role.User;
    } else if (response.user.role === 1) {
      user.role = Role.Admin;
    } else if (response.user.role === 2) {
      user.role = Role.SuperUser;
    }
    if (response.user.avatar) {
      user.avatar = response.user.avatar;
    } else {
      //user.avatar = '';
    }
    if (response.user.username) {
      user.username = response.user.username;
    } else {
      user.username = '';
    }
    if (response.user.banner) {
      user.banner = response.user.banner;
    }
    if (response.user.walletAddresses) {
      user.walletAddresses = response.user.walletAddresses;
    }
    if (response.user.linkedWalletAddresses) {
      user.linkedWalletAddresses = response.user.linkedWalletAddresses;
    }
    user.bio = response.user.bio;
    user._id = response.user.id;
    this.setUser(user);
    this.setAccessToken(response.token);
    this.setRefreshToken(response.refreshToken);
    this._authenticated = true;
  }

  /**
   * This method maps the UserCredential model returned by Firebase auth to the User model we maintain in the
   * marketplace app. We left some unused variables in the code to demonstrate how to access important fields.
   *
   * @param userCredential: firebase.auth.UserCredential
   * @private
   */
  private async mapFirebaseUserCredentialsToUser(userCredential: firebase.auth.UserCredential): Promise<User> {
    // UserInfo fields
    const user: firebase.User = userCredential.user;
    const displayName = user.displayName;
    const email = user.email;
    const phoneNumber = user.phoneNumber;
    const photoUrl = user.photoURL;
    const providerId = user.providerId;
    const userId = user.uid;

    // User fields (extends UserInfo)
    const tenantId = user.tenantId;

    // AdditionalUserInfo fields
    const username = userCredential.additionalUserInfo.username;
    const profile = userCredential.additionalUserInfo.profile; // map containing IDP-specific user data

    const idToken: IdTokenResult = await user.getIdTokenResult();
    const token = idToken.token; // Firebase Auth ID token JWT string
    const signInProvider = idToken.signInProvider; // Sign-In provider the ID token was obtained

    return {
      id: userId,
      _id: userId,
      name: displayName,
      bio: '',
      email: email,
      avatar: photoUrl,
      status: null,
      role: Role.Admin,
      accessToken: token,
      isFirebaseUser: true,
      firebaseUser: user
    };
  }

  private updateUserInformation(user: User) {
    this.setAccessToken(user.accessToken);
    this.setRefreshToken(user.refreshToken);
    this.setUser(user);
    this.userService.user = user;
  }

  private isValidCachedToken = () => !AuthUtils.isTokenExpired(this.accessToken) && !AuthUtils.isTokenExpired(this.accessToken);

  private getFireAuthProvider = () => new firebase.auth.GoogleAuthProvider();
}
