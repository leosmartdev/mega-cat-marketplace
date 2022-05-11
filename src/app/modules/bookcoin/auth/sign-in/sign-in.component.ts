import { Component, OnInit, ViewChild, ViewEncapsulation } from '@angular/core';
import { FormBuilder, FormGroup, NgForm, Validators } from '@angular/forms';
import { ActivatedRoute, Router, RoutesRecognized } from '@angular/router';
import { fuseAnimations } from '@fuse/animations';
import { FuseAlertType } from '@fuse/components/alert';
import { AuthService } from 'app/core/auth/auth.service';
import { SocialAuthService, GoogleLoginProvider, SocialUser } from 'angularx-social-login';
import firebase from 'firebase/compat/app';
import { Observable } from 'rxjs';
import { RouteMonitorService } from 'app/shared/route-monitor.service';
import { WalletService } from 'app/core/wallet/wallet.service';

@Component({
  selector: 'auth-sign-in',
  templateUrl: './sign-in.component.html',
  styleUrls: ['./sign-in.component.scss'],
  encapsulation: ViewEncapsulation.None,
  animations: fuseAnimations
})
export class SignInComponent implements OnInit {
  @ViewChild('signInNgForm') signInNgForm: NgForm;

  alert: { type: FuseAlertType; message: string } = {
    type: 'success',
    message: ''
  };
  signInForm: FormGroup;
  showAlert: boolean = false;
  eReaderRedirectUri: string;

  /**
   * Constructor
   */
  constructor(
    private activatedRoute: ActivatedRoute,
    private authService: AuthService,
    private formBuilder: FormBuilder,
    private router: Router,
    private socialAuthService: SocialAuthService,
    private routeMonitorService: RouteMonitorService,
    private _walletService: WalletService
  ) {}

  /**
   * On init
   */
  ngOnInit(): void {
    this.eReaderRedirectUri = this.activatedRoute.snapshot.queryParamMap.get('ereader_redirect_uri') || null;
    this.signInForm = this.formBuilder.group({
      usernameOrEmail: ['', Validators.required],
      password: ['', Validators.required],
      rememberMe: ['']
    });
  }

  /**
   * Sign in
   */
  signIn(): void {
    if (this.signInForm.invalid) {
      return;
    }

    this.signInForm.disable();
    this.showAlert = false;
    const usernameOrEmail: string = this.signInForm.value.usernameOrEmail;
    const password: string = this.signInForm.value.password;

    if (this.isEmail(usernameOrEmail)) {
      this.logInWithEmail(usernameOrEmail, password);
    } else {
      this.lookupEmailFromUsername(usernameOrEmail).subscribe(
        (res) => {
          this.logInWithEmail(res.email, password);
        },
        (error) => this.handleError('Username unavailable, Sign in with Email')
      );
    }
  }

  /**
   * Google SSO
   */
  public async signInWithGoogle() {
    this.authService.firebaseSignInWithGoogle().subscribe(
      (user: firebase.auth.UserCredential) => {
        this.authService.saveUserUsingJWTGoogle(this.authService.accessToken).subscribe(() => {
          if (this.eReaderRedirectUri) {
            this.navigateToEreader();
          } else {
            this.router.navigateByUrl(this.routeMonitorService.getPreviousUrl());
          }
        });
      },
      (error) => this.handleError(error)
    );
  }

  private isEmail(usernameOrEmail: string) {
    return usernameOrEmail.indexOf('@') >= 1;
  }

  private logInWithEmail(email: string, password: string) {
    this.authService.firebaseSignIn({ email, password }).subscribe(
      (user: firebase.auth.UserCredential) => {
        this.authService.signIn(email, user.user.uid).subscribe(
          (response) => {
            //successful login

            const oldRoute = this.routeMonitorService.getPreviousUrl();
            if (this.eReaderRedirectUri) {
              this.navigateToEreader();
            } else if (!this._walletService.currentAccount) {
              this.router.navigate(['bookcoin/wallet-connect']);
            } else {
              this.router.navigate([oldRoute]);
            }
          },
          (error) => {
            //redirect to new sign up page
            this.router.navigate(['sign-up-bkcn', { email: email, password: password }]);
          }
        );
      },
      (error) => this.handleError(error.message)
    );
  }

  private handleError(errorMessage) {
    this.signInForm.enable();
    this.signInNgForm.resetForm();
    this.alert = {
      type: 'error',
      message: errorMessage ? errorMessage : 'Wrong email, password, or you are not registered.'
    };
    this.showAlert = true;
  }

  private lookupEmailFromUsername = (username: any) => this.authService.lookupEmail(username);

  private navigateToEreader = () => {
    const redirectUrl = this.eReaderRedirectUri + `?accessToken=${this.authService.accessToken}&refreshToken=${this.authService.refreshToken}`;
    window.location.href = redirectUrl;
  };
}
