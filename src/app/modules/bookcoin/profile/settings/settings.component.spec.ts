import { ComponentFixture, fakeAsync, flush, TestBed } from '@angular/core/testing';

import { SettingsComponent } from './settings.component';
import { FormBuilder } from '@angular/forms';
import { AuthService } from 'app/core/auth/auth.service';
import { SharedService } from 'app/core/shared/shared.service';
import { WalletService } from '../../../../core/wallet/wallet.service';
import { of } from 'rxjs';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { RouterTestingModule } from '@angular/router/testing';
import { MatDialog } from '@angular/material/dialog';
import { mockUser } from 'app/core/auction/spec-files/mocked';
import { WizardDialogService } from 'app/shared/wizard-dialog-service/wizard-dialog.service';
import { WizardStage } from 'app/shared/wizard-dialog-service/wizard-stage.model';
import { ErrorsService } from 'app/core/errors/errors.service';

describe('SettingsComponent', () => {
  let component: SettingsComponent;
  let fixture: ComponentFixture<SettingsComponent>;
  const authServiceMock = jasmine.createSpyObj('AuthService', [
    'check',
    'updateBanner',
    'updateProfile',
    'updateAvatar',
    'updateWalletAddresses',
    'updateLinkedWalletAddresses',
    'isAdmin',
    'updateLinkedWalletAddresses',
    'deleteLinkedWalletAddresses',
    'deleteWalletAddresses'
  ]);
  const walletServiceMock = jasmine.createSpyObj('WalletService', ['getAccounts']);
  const wizardServiceMock = jasmine.createSpyObj('WizardDialogService', ['advanceStages', 'showWizard', 'setError']);
  walletServiceMock.getAccounts.and.returnValue(of([]));
  authServiceMock.check.and.returnValue(of(true));
  authServiceMock.updateAvatar.and.returnValue(of(null));
  authServiceMock.updateBanner.and.returnValue(of(null));
  authServiceMock.updateProfile.and.returnValue(of(null));
  authServiceMock.updateWalletAddresses.and.returnValue(of(null));
  authServiceMock.updateLinkedWalletAddresses.and.returnValue(of(null));
  authServiceMock.isAdmin.and.returnValue(of(false));
  const errorServiceMock = jasmine.createSpyObj('ErrorsService', ['openSnackBar']);
  const matDialogMock = jasmine.createSpyObj('MatDialog', ['close', 'closeAll']);
  const stages: WizardStage[] = [
    {
      name: '',
      status: 'dormant',
      description: 'Saving the changes...'
    }
  ];

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [SettingsComponent],
      imports: [HttpClientTestingModule, RouterTestingModule],
      providers: [
        { provide: SharedService },
        { provide: FormBuilder },
        { provide: ErrorsService, useValue: errorServiceMock },
        { provide: MatDialog, useValue: matDialogMock },
        { provide: WalletService, useValue: walletServiceMock },
        { provide: AuthService, useValue: authServiceMock },
        { provide: WizardDialogService, useValue: wizardServiceMock }
      ]
    }).compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(SettingsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  afterEach(() => {
    fixture.destroy();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should set avatar equal to user avatar', () => {
    component.user = mockUser;
    component.setAvatar();

    expect(component.avatar).toEqual(mockUser.avatar);
  });

  it('should set users banner successfully', () => {
    component.user = mockUser;

    component.setBanner();

    expect(component.banner).toEqual(mockUser.banner);
  });

  it('should update avatar to the provided file', () => {
    const spyUpdate = spyOn(component, 'updateAvatar');
    const spyImage = spyOn<any>(component, 'setProfileImage').and.callThrough();

    const event = { target: { files: [new Blob(['test1.png', 'test2.png', 'test3.png'])], result: 'Test Result' } };

    component.onChangeAvatar(event);

    expect(spyImage).toHaveBeenCalledWith(event);
    expect(spyUpdate).toHaveBeenCalledTimes(1);
  });

  it('should copy the wallet address to clipboard', fakeAsync(() => {
    component.copy('testAddress');
    flush();

    navigator.clipboard.readText().then((address) => {
      expect(address).toEqual('testAddress');
    });
  }));

  it('should show a snackbar error if file dimensions are not correct', (done) => {
    const event = { target: { files: [new Blob(['test1.png'])], result: 'Test Result' } };
    spyOn(window.URL, 'createObjectURL');
    spyOn(window.URL, 'revokeObjectURL');

    component.onChangeBanner(event);

    setTimeout(() => {
      expect(errorServiceMock.openSnackBar).toHaveBeenCalledWith('Banner should be 1600 x 400 size!', 'Error');
      done();
    }, 3000);
  });

  it('should update avatar', () => {
    const spyShow = spyOn<any>(component, 'showAvatarWizardDialog');
    component.updateAvatarForm.controls['image'].setValue('test.png');

    component.updateAvatar();

    expect(spyShow).toHaveBeenCalledTimes(1);
    expect(authServiceMock.updateAvatar).toHaveBeenCalled();
    expect(wizardServiceMock.advanceStages).toHaveBeenCalled();
  });

  it('should update avatar', () => {
    const spyShow = spyOn<any>(component, 'showBannerWizardDialog');
    component.updateBannerForm.controls['banner'].setValue('test.png');

    component.updateBanner();

    expect(spyShow).toHaveBeenCalledTimes(1);
    expect(authServiceMock.updateBanner).toHaveBeenCalled();
    expect(wizardServiceMock.advanceStages).toHaveBeenCalled();
  });

  it('should submit and update profile successfully', () => {
    const spyShow = spyOn<any>(component, 'showWizardDialog');
    component.updateAccountForm.controls['bio'].setValue('Some Bio');

    component.submit();

    expect(spyShow).toHaveBeenCalledTimes(1);
    expect(authServiceMock.updateProfile).toHaveBeenCalled();
    expect(wizardServiceMock.advanceStages).toHaveBeenCalled();
  });

  it('should show wizard dialog for updating profile', () => {
    (component as any).showWizardDialog();

    expect(wizardServiceMock.showWizard).toHaveBeenCalledWith('Updating Profile', stages, true);
  });

  it('should show wizard dialog for updating avatar', () => {
    (component as any).showAvatarWizardDialog();

    expect(wizardServiceMock.showWizard).toHaveBeenCalledWith('Updating Avatar', stages, true);
  });

  it('should show wizard dialog for updating banner', () => {
    (component as any).showBannerWizardDialog();

    expect(wizardServiceMock.showWizard).toHaveBeenCalledWith('Updating Banner', stages, true);
  });

  describe('Wallets', () => {
    it('should update the linked wallets', () => {
      authServiceMock.updateLinkedWalletAddresses.and.returnValue(of({ linkedWalletAddresses: mockUser.linkedWalletAddresses }));

      component.updateLinkedWallets('testAddress');

      expect(component.linkedWalletAddresses).toEqual(mockUser.linkedWalletAddresses);
      expect(authServiceMock.updateLinkedWalletAddresses).toHaveBeenCalled();
    });

    it('should delete the linked wallets', () => {
      authServiceMock.deleteLinkedWalletAddresses.and.returnValue(of({ linkedWalletAddresses: mockUser.linkedWalletAddresses }));

      component.deleteLinkedWallets('testAddress');

      expect(component.linkedWalletAddresses).toEqual(mockUser.linkedWalletAddresses);
      expect(authServiceMock.deleteLinkedWalletAddresses).toHaveBeenCalled();
    });

    it('should delete a specific wallet', () => {
      authServiceMock.deleteWalletAddresses.and.returnValue(of({ walletAddresses: mockUser.walletAddresses }));
      authServiceMock.deleteLinkedWalletAddresses.and.returnValue(of({ linkedWalletAddresses: mockUser.linkedWalletAddresses }));

      component.deleteWallet('testAddress');

      expect(component.walletAddresses).toEqual(mockUser.walletAddresses);
      expect(authServiceMock.deleteWalletAddresses).toHaveBeenCalled();
    });
  });
});
