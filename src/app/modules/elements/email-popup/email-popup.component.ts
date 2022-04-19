import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { AuthService } from 'app/core/auth/auth.service';
import { BsModalService } from 'ngx-bootstrap/modal';
import { User } from '../../../core/user/user.types';

@Component({
  selector: 'app-email-popup',
  templateUrl: './email-popup.component.html',
  styleUrls: ['./email-popup.component.scss']
})
export class EmailPopupComponent implements OnInit {
  formFieldHelpers: string[] = [''];
  public user;
  updateEmailForm: FormGroup;
  constructor(private _authService: AuthService, private modalService: BsModalService, private _formBuilder: FormBuilder) {}

  ngOnInit(): void {
    this.updateEmailForm = this._formBuilder.group({
      usernameOrEmail: ['', Validators.required]
    });

    this.user = this.modalService.config.initialState;

    this.user = this._authService.user;
  }
  getUser(): User {
    return this._authService.user;
  }

  onChange(event) {
    this.updateEmailForm.controls['email'].setValue(event.target.value);
  }

  updateEmail(): void {
    if (this.updateEmailForm.value.email) {
      this.modalService.hide();
      const formData = new FormData();
      formData.append('email', this.updateEmailForm.value.email);
      this._authService.updateEmail(formData).subscribe();
    }
  }
}
