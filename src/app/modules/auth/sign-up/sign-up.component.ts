import { Component, OnInit, ViewChild, ViewEncapsulation } from '@angular/core';
import { FormBuilder, FormGroup, NgForm, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { fuseAnimations } from '@fuse/animations';
import { FuseAlertType } from '@fuse/components/alert';
import { AuthService } from 'app/core/auth/auth.service';
import { ErrorsService } from 'app/core/errors/errors.service';

@Component({
  selector: 'auth-sign-up',
  templateUrl: './sign-up.component.html',
  encapsulation: ViewEncapsulation.None,
  animations: fuseAnimations
})
export class AuthSignUpComponent implements OnInit {
  @ViewChild('signUpForm') signUpNgForm: NgForm;

  alert: { type: FuseAlertType; message: string } = {
    type: 'success',
    message: ''
  };
  signUpForm: FormGroup;
  showAlert: boolean = false;

  /**
   * Constructor
   */
  constructor(private _authService: AuthService, private _formBuilder: FormBuilder, private _router: Router, private _errorsService: ErrorsService) {}

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
      email: ['', [Validators.required, Validators.email]],
      password: ['', Validators.required],
      company: [''],
      agreements: ['', Validators.requiredTrue]
    });
  }

  // -----------------------------------------------------------------------------------------------------
  // @ Public methods
  // -----------------------------------------------------------------------------------------------------
  validateNumber(event) {
    const keyCode = event.which ? event.which : event.keyCode;

    const excludedKeys = [8, 37, 39, 46];

    if ((keyCode >= 48 && keyCode <= 57) || (keyCode >= 96 && keyCode <= 105 && excludedKeys.includes(keyCode))) {
      event.preventDefault();
    }
  }
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

    // Sign up
    this._authService.firebaseSignUp(this.signUpForm.value).subscribe(
      (response) => {
        const inputs = Object.assign({}, this.signUpForm.value);
        inputs.usernameOrEmail = inputs.email;
        this._authService.signUp(inputs).subscribe((signedUpUserResponse) => {
          this._router.navigate(['signed-in-redirect']);
        });
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
}
