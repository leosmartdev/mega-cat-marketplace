import { NftUtilsService } from './../../../shared/nft-utils.service';
import { Component, OnInit, NgZone } from '@angular/core';
import { AuthService } from 'app/core/auth/auth.service';
import { User } from '../../../core/user/user.types';
import { WalletService } from '../../../core/wallet/wallet.service';
import { ProductService } from 'app/core/product/product.service';
import { ErrorsService } from 'app/core/errors/errors.service';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { VenlyService } from 'app/core/venly/venly.service';
import { Offer } from 'app/core/models/offer.model';
import { VenlyWalletNft } from 'app/core/models/venly/venly-wallet-nft.model';
import { AchievementService } from 'app/core/achievement/achievement.service';
import { Subscription } from 'rxjs';
import { SettingsComponent } from './settings/settings.component';
import { subscribeOn } from 'rxjs/operators';

@Component({
  selector: 'app-profile',
  templateUrl: './profile.component.html',
  styleUrls: ['./profile.component.scss']
})
export class ProfileComponent implements OnInit {
  user: User;
  avatar: string = null;
  banner: string = null;
  walletAddress: string;
  updateAvatarForm: FormGroup;
  updateBannerForm: FormGroup;
  isAdmin: boolean = false;
  loading: false;
  subscription: Subscription;

  constructor(
    private authService: AuthService,
    public walletService: WalletService,
    private ngZone: NgZone,
    private formBuilder: FormBuilder,
    private utilsService: NftUtilsService,
    private achievementService: AchievementService
  ) {}

  ngOnInit(): void {
    this.user = this.authService.user;
    // Set profile info on init

    this.setWalletAddress();
    this.setAvatar();
    this.setBanner();
    this.updateAvatarForm = this.formBuilder.group({
      image: ['', Validators.required]
    });
    this.updateBannerForm = this.formBuilder.group({
      image: ['', Validators.required]
    });
    this.isAdmin = this.authService.isAdmin();
  }

  subscribeToEmiter(componentRef) {
    if (!(componentRef instanceof SettingsComponent)) {
      return;
    }
    const child: SettingsComponent = componentRef;
    child.clickEvent.subscribe((event) => {
      if (typeof event === 'string') {
        this.banner = event;
        return;
      }
      this.onChangeAvatar(event);
    });
  }
  unsubscribe() {
    if (this.subscription) {
      this.subscription.unsubscribe();
    }
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

  onChangeAvatar(event) {
    this.updateAvatarForm.controls['image'].setValue(event.target.files[0]);
    this.setProfileImage(event);
    this.updateAvatar();
  }

  updateAvatar(): void {
    if (this.updateAvatarForm.value.image) {
      const formData = new FormData();
      formData.append('avatar', this.updateAvatarForm.value.image);
      this.authService.updateAvatar(formData).subscribe((x) => {});
      this.avatar = this.user.avatar;
    }
  }

  openNft(nft) {}
  private setProfileImage(changeEvent) {
    const reader = new FileReader();
    reader.onload = (event: any) => {
      this.avatar = event.target.result;
    };

    reader.onerror = (event: any) => {};

    reader.readAsDataURL(changeEvent.target.files[0]);
  }
}
