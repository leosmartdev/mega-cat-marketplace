import { Component, EventEmitter, Input, NgZone, OnInit, Output, SimpleChange } from '@angular/core';
import { AuthService } from 'app/core/auth/auth.service';
import { User } from '../../../core/user/user.types';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { WalletService } from 'app/core/wallet/wallet.service';

@Component({
  selector: 'app-profile-navlinks',
  templateUrl: './profile-navlinks.component.html',
  styleUrls: ['./profile-navlinks.component.scss']
})
export class ProfileNavlinksComponent implements OnInit {
  /*eslint-disable */
  @Output() onChangeAvatar = new EventEmitter();
  @Input() avatarData;
  @Input() bannerData;
  /*eslint-enable */
  walletAddress: string;
  user: User;
  isAdmin: boolean = false;
  avatar: string = null;
  banner: string = null;
  updateAvatarForm: FormGroup;

  constructor(private authService: AuthService, public walletService: WalletService, private ngZone: NgZone, private _formBuilder: FormBuilder) {}

  ngOnInit(): void {
    this.isAdmin = this.authService.isAdmin();
    this.user = this.authService.user;
    this.isAdmin = this.authService.isAdmin();
    this.setAvatar();
    this.setBanner();
    this.setWalletAddress();
    this.updateAvatarForm = this._formBuilder.group({
      image: ['', Validators.required]
    });
  }
  /*eslint-disable */
  ngOnChanges(changes: { [property: string]: SimpleChange }) {
    const change: SimpleChange = changes['avatarData'];
    if (change) {
      this.avatar = change.currentValue;
    }

    const change1: SimpleChange = changes['bannerData'];
    if (change1) {
      this.banner = change1.currentValue;
    }
  }
  /*eslint-enable */
  setWalletAddress() {
    this.walletService.getAccounts().subscribe((accounts) => {
      this.ngZone.run(() => {
        if (accounts.length === 0) {
          this.walletAddress = null;
        } else {
          this.walletAddress = accounts[0];
        }
      });
    });
  }

  setAvatar() {
    if (this.user && this.user.avatar) {
      this.avatar = this.user.avatar;
    } else {
      this.avatar = 'https://cdn.shopify.com/s/files/1/1494/4102/t/7/assets/pf-5005c27f--IWantYouUncleSam4.png?v=1593416331';
    }
  }

  setBanner() {
    if (this.user && this.user.banner) {
      this.banner = this.user.banner;
    } else {
      this.banner = '';
    }
  }
  onAvatarChange(event) {
    this.onChangeAvatar.emit(event);
    this.updateAvatarForm.controls['image'].setValue(event.target.files[0]);
    this.setProfileImage(event);
    this.updateAvatar();
  }

  updateAvatar(): void {
    if (this.updateAvatarForm.value.image) {
      const formData = new FormData();
      formData.append('avatar', this.updateAvatarForm.value.image);
      this.authService.updateAvatar(formData).subscribe();
    }
  }

  getUser(): User {
    return this.authService.user;
  }
  private setProfileImage(changeEvent) {
    const reader = new FileReader();
    reader.onload = (event: any) => {
      this.avatar = event.target.result;
    };

    reader.onerror = (event: any) => {};

    reader.readAsDataURL(changeEvent.target.files[0]);
  }
}
