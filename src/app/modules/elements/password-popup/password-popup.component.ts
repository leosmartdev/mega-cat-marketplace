import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { AuthService } from 'app/core/auth/auth.service';
import { BsModalService } from 'ngx-bootstrap/modal';
import { User } from '../../../core/user/user.types';

@Component({
  selector: 'app-password-popup',
  templateUrl: './password-popup.component.html',
  styleUrls: ['./password-popup.component.scss']
})
export class PasswordPopupComponent implements OnInit {
  formFieldHelpers: string[] = [''];
  public user;
  updatePasswordForm: FormGroup;
  public cpassword: string = null;
  public errorMsg: boolean = false;
  public errorMsg1: boolean = false;
  constructor(private _authService: AuthService, private modalService: BsModalService, private _formBuilder: FormBuilder) {}

  ngOnInit(): void {
    this.updatePasswordForm = this._formBuilder.group({
      password: ['', Validators.required]
    });

    this.user = this.modalService.config.initialState;

    this.user = this._authService.user;
  }
  getUser(): User {
    return this._authService.user;
  }

  onChange(event) {
    this.updatePasswordForm.controls['password'].setValue(event.target.value);
  }

  onUpdate(event) {
    this.cpassword = event.target.value;
  }
  updatePassword(): void {
    if (this.updatePasswordForm.value.password && this.cpassword) {
      if (this.updatePasswordForm.value.password === this.cpassword) {
        this.modalService.hide();
        this.errorMsg = false;
        this.errorMsg1 = false;
        const formData = new FormData();
        formData.append('password', this.updatePasswordForm.value.password);
        this._authService.updatePassword(formData).subscribe();
      } else {
        this.errorMsg1 = false;
        this.errorMsg = true;
      }
    } else {
      this.errorMsg1 = true;
      this.errorMsg = false;
    }
  }
}
