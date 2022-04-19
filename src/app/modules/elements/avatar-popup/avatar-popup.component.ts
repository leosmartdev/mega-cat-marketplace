import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { BsModalService } from 'ngx-bootstrap/modal';
import { AuthService } from 'app/core/auth/auth.service';
import { User } from '../../../core/user/user.types';
import { Router } from '@angular/router';

@Component({
  selector: 'app-avatar-popup',
  templateUrl: './avatar-popup.component.html',
  styleUrls: ['./avatar-popup.component.scss']
})
export class AvatarPopupComponent implements OnInit {
  formFieldHelpers: string[] = [''];
  public user;
  updateAvatarForm: FormGroup;
  constructor(private _authService: AuthService, private modalService: BsModalService, private _formBuilder: FormBuilder, private _router: Router) {}

  ngOnInit(): void {
    this.updateAvatarForm = this._formBuilder.group({
      image: ['', Validators.required]
    });

    this.user = this.modalService.config.initialState;

    this.user = this._authService.user;
  }

  getUser(): User {
    return this._authService.user;
  }

  onChange(event) {
    this.updateAvatarForm.controls['image'].setValue(event.target.files[0]);
  }

  updateAvatar(): void {
    if (this.updateAvatarForm.value.image) {
      this.modalService.hide();
      const formData = new FormData();
      formData.append('avatar', this.updateAvatarForm.value.image);
      this._authService.updateAvatar(formData).subscribe();
      const redirectURL = '/profile';
      // Navigate to the redirect url
      this._router.navigateByUrl(redirectURL);
    }
  }

  removeAvatar(): void {
    this.modalService.hide();
    this._authService.removeAvatar().subscribe();
  }
}
