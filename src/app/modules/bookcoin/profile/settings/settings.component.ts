import { Component, NgZone, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { AuthService } from 'app/core/auth/auth.service';
import { WalletService } from '../../../../core/wallet/wallet.service';
import { User } from '../../../../core/user/user.types';
import { FuseValidators } from '@fuse/validators';
import { SharedService } from 'app/core/shared/shared.service';
import { WizardStage } from 'app/shared/wizard-dialog-service/wizard-stage.model';
import { WizardDialogService } from 'app/shared/wizard-dialog-service/wizard-dialog.service';
import { ErrorsService } from 'app/core/errors/errors.service';

@Component({
  selector: 'app-settings',
  templateUrl: './settings.component.html',
  styleUrls: ['./settings.component.scss']
})
export class SettingsComponent implements OnInit {
  walletAddresses: string[] = [];
  linkedWalletAddresses: string[] = [];
  user: User;
  avatar: string = null;
  banner: string = null;
  updateAccountForm: FormGroup;
  updateAvatarForm: FormGroup;
  updateBannerForm: FormGroup;
  isAdmin: boolean = false;
  public url: string = '';

  constructor(
    private authService: AuthService,
    public walletService: WalletService,
    private ngZone: NgZone,
    private _formBuilder: FormBuilder,
    private sharedService: SharedService,
    private wizardService: WizardDialogService,
    private errorsService: ErrorsService
  ) {
    this.sharedService.url.subscribe((value) => (this.url = value));
  }

  ngOnInit(): void {
    this.user = this.authService.user;
    this.walletAddresses = this.user?.walletAddresses;
    this.linkedWalletAddresses = this.user?.linkedWalletAddresses;
    this.setAvatar();
    this.setBanner();
    this.setWallet();
    this.isAdmin = this.authService.isAdmin();

    // Set forms
    this.updateAccountForm = this._formBuilder.group(
      {
        username: [this.user?.username, Validators.required],
        email: [this.user?.email, Validators.required],
        bio: [this.user?.bio],
        password: ['', Validators.required],
        confirmPassword: ['', Validators.required]
      },
      {
        validators: FuseValidators.mustMatch('password', 'confirmPassword')
      }
    );

    this.updateAvatarForm = this._formBuilder.group({
      image: ['', Validators.required]
    });

    this.updateBannerForm = this._formBuilder.group({
      banner: ['', Validators.required]
    });
  }
  setWallet() {
    this.walletService.getAccounts().subscribe((accounts) => {
      this.ngZone.run(() => {
        if (accounts.length > 0) {
          if (!this.walletAddresses.includes(accounts[0])) {
            this.walletAddresses.push(accounts[0]);
          }
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
      this.banner = 'https://cdn.shopify.com/s/files/1/0444/0919/2598/t/3/assets/pf-f5441dcf--bg2.png?v=1600930013';
    }
  }

  copy(walletAddress, element = null) {
    navigator.clipboard.writeText(walletAddress);
    if (element) {
      const messageElement = $(element.parentElement.parentElement.parentElement.nextElementSibling);
      // @ts-ignore: Unreachable code error
      messageElement.css('opacity', 1);
      setTimeout(() => {
        // @ts-ignore: Unreachable code error
        messageElement.css('opacity', 0);
      }, 500);
    }
  }

  onChangeAvatar(event) {
    this.updateAvatarForm.controls['image'].setValue(event.target.files[0]);
    this.setProfileImage(event);
    this.updateAvatar();
  }

  onChangeBanner(event) {
    const reader = new FileReader();
    const file = event.target.files[0];

    const img = new Image();

    img.src = window.URL.createObjectURL(file);
    reader.readAsDataURL(file);
    reader.onload = () => {
      setTimeout(() => {
        const width = img.naturalWidth;
        const height = img.naturalHeight;

        window.URL.revokeObjectURL(img.src);

        if (width < 1600 || height < 400) {
          this.errorsService.openSnackBar('Banner should be 1600 x 400 size!', 'Error');
        } else {
          this.updateBannerForm.controls['banner'].setValue(event.target.files[0]);
          this.setProfileBanner(event);
          this.updateBanner();
        }
      }, 2000);
    };
  }

  updateAvatar(): void {
    if (this.updateAvatarForm.value.image) {
      this.showAvatarWizardDialog();
      const formData = new FormData();
      formData.append('avatar', this.updateAvatarForm.value.image);
      this.authService.updateAvatar(formData).subscribe();
      this.wizardService.advanceStages();
    }
  }

  updateBanner(): void {
    if (this.updateBannerForm.value.banner) {
      this.showBannerWizardDialog();

      const formData = new FormData();
      formData.append('banner', this.updateBannerForm.value.banner);
      this.authService.updateBanner(formData).subscribe();
      this.wizardService.advanceStages();
    }
  }

  updateLinkedWallets(address): void {
    const formData = new FormData();
    formData.append('walletAddress', address);
    this.authService.updateLinkedWalletAddresses(formData).subscribe((response) => {
      this.linkedWalletAddresses = response.linkedWalletAddresses;
    });
  }

  deleteLinkedWallets(address): void {
    const formData = new FormData();
    formData.append('walletAddress', address);
    this.authService.deleteLinkedWalletAddresses(formData).subscribe((response) => {
      this.linkedWalletAddresses = response.linkedWalletAddresses;
    });
  }

  deleteWallet(address): void {
    const formData = new FormData();
    formData.append('walletAddress', address);
    this.authService.deleteWalletAddresses(formData).subscribe((response) => {
      this.walletAddresses = response.walletAddresses;
    });
    this.authService.deleteLinkedWalletAddresses(formData).subscribe((response) => {
      this.linkedWalletAddresses = response.linkedWalletAddresses;
    });
  }

  submit() {
    this.showWizardDialog();
    const formData = new FormData();
    formData.append('bio', this.updateAccountForm.value.bio);
    this.authService.updateProfile(formData).subscribe();
    this.wizardService.advanceStages();
  }

  private showWizardDialog() {
    const stages: WizardStage[] = [
      {
        name: '',
        status: 'dormant',
        description: 'Saving the changes...'
      }
    ];

    this.wizardService.showWizard('Updating Profile', stages, true);
  }

  private showAvatarWizardDialog() {
    const stages: WizardStage[] = [
      {
        name: '',
        status: 'dormant',
        description: 'Saving the changes...'
      }
    ];

    this.wizardService.showWizard('Updating Avatar', stages, true);
  }

  private showBannerWizardDialog() {
    const stages: WizardStage[] = [
      {
        name: '',
        status: 'dormant',
        description: 'Saving the changes...'
      }
    ];

    this.wizardService.showWizard('Updating Banner', stages, true);
  }

  private setProfileBanner(changeEvent) {
    const reader = new FileReader();
    reader.onload = (event: any) => {
      this.banner = event.target.result;
    };

    reader.onerror = (event: any) => {};

    reader.readAsDataURL(changeEvent.target.files[0]);
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
