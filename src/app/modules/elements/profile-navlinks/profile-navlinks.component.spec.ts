import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ProfileNavlinksComponent } from './profile-navlinks.component';
import { of } from 'rxjs';
import { AuthService } from 'app/core/auth/auth.service';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { WalletService } from 'app/core/wallet/wallet.service';
import { FormBuilder } from '@angular/forms';
import { mockUser } from 'app/core/auction/spec-files/mocked';

describe('ProfileNavlinksComponent', () => {
  let component: ProfileNavlinksComponent;
  let fixture: ComponentFixture<ProfileNavlinksComponent>;

  const authServiceMock = jasmine.createSpyObj('AuthService', ['updateAvatar', 'isAdmin']);
  authServiceMock.updateAvatar.and.returnValue(of(null));
  authServiceMock.isAdmin.and.returnValue(of(false));
  const walletServiceMock = jasmine.createSpyObj('WalletService', ['user', 'getAccounts']);
  walletServiceMock.user = 'someone';
  walletServiceMock.getAccounts.and.returnValue(of([]));

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ProfileNavlinksComponent],
      imports: [HttpClientTestingModule],
      providers: [{ provide: AuthService, useValue: authServiceMock }, { provide: FormBuilder }, { provide: WalletService, useValue: walletServiceMock }]
    }).compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(ProfileNavlinksComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should set users avatar successfully', () => {
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

    component.onAvatarChange(event);

    expect(spyImage).toHaveBeenCalledWith(event);
    expect(spyUpdate).toHaveBeenCalledTimes(1);
  });

  it('should update avatar', () => {
    component.updateAvatarForm.controls['image'].setValue('test.png');

    component.updateAvatar();

    expect(authServiceMock.updateAvatar).toHaveBeenCalled();
  });

  it('should get user successfully', () => {
    authServiceMock.user = mockUser;

    const response = component.getUser();

    expect(response).toEqual(mockUser);
  });

  it('should set the wallet address to the first account address', () => {
    walletServiceMock.getAccounts.and.returnValue(of(['test address']));

    component.setWalletAddress();

    expect(component.walletAddress).toEqual('test address');
  });
});
