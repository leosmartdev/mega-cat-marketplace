import { Component, OnInit, ViewChild, ViewEncapsulation } from '@angular/core';
import { FormBuilder, FormGroup, NgForm, Validators } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
import { fuseAnimations } from '@fuse/animations';
import { FuseAlertType } from '@fuse/components/alert';
import { AuthService } from 'app/core/auth/auth.service';
import { ErrorsService } from 'app/core/errors/errors.service';
import { WalletService } from 'app/core/wallet/wallet.service';
import { switchMap } from 'rxjs/operators';

@Component({
  selector: 'app-sign-up-mcl',
  templateUrl: './sign-up-mcl.component.html',
  encapsulation: ViewEncapsulation.None,
  animations: fuseAnimations
})
export class SignUpMclComponent implements OnInit {
  @ViewChild('signUpForm') signUpNgForm: NgForm;

  alert: { type: FuseAlertType; message: string } = {
    type: 'success',
    message: ''
  };
  signUpForm: FormGroup;
  showAlert: boolean = false;
  isAgree = false;
  ngZone: any;
  email: string = '';

  /**
   * Constructor
   */
  constructor(
    private _authService: AuthService,
    private _formBuilder: FormBuilder,
    private _router: Router,
    private _errorsService: ErrorsService,
    public _walletService: WalletService,
    private _route: ActivatedRoute
  ) {}

  // -----------------------------------------------------------------------------------------------------
  // @ Lifecycle hooks
  // -----------------------------------------------------------------------------------------------------

  /**
   * On init
   */
  ngOnInit(): void {
    // Create the form

    this.signUpForm = this._formBuilder.group({
      username: ['', Validators.required],
      firstName: ['', Validators.required],
      lastName: ['', Validators.required],
      email: [this._route.snapshot.paramMap.get('email') ? this._route.snapshot.paramMap.get('email') : '', [Validators.required, Validators.email]],
      password: [this._route.snapshot.paramMap.get('password') ? this._route.snapshot.paramMap.get('password') : '', Validators.required],
      company: [''],
      agreements: ['', Validators.required]
    });
  }

  // -----------------------------------------------------------------------------------------------------
  // @ Public methods
  // -----------------------------------------------------------------------------------------------------

  /**
   * Sign up
   */
  signUp(): void {
    // Do nothing if the form is invalid
    if (this.signUpForm.invalid) {
      return;
    }

    // Disable the form
    this.signUpForm.disable();

    // Hide the alert
    this.showAlert = false;

    const inputs = Object.assign({}, this.signUpForm.value);
    inputs.usernameOrEmail = inputs.email;
    this._authService.signUp(inputs).subscribe(
      (signedUpUserResponse) => {
        if (!this._walletService.currentAccount) {
          this._router.navigate(['profile/wallet']);
        } else {
          this._router.navigate(['signed-in-redirect']);
        }
      },
      (error) => {
        this._errorsService.openSnackBar('Username or email already exists!', 'Error');
        this.signUpForm.enable();
        this.signUpNgForm.resetForm();
        this.alert = {
          type: 'error',
          message: 'Something went wrong, please try again.'
        };
        this.showAlert = true;
      }
    );
  }

  termsCheck() {
    this.isAgree = !this.isAgree;
  }
}
