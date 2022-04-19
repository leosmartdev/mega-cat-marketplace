// tslint:disable
import { TestBed } from '@angular/core/testing';
import { CUSTOM_ELEMENTS_SCHEMA, NO_ERRORS_SCHEMA } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { of as observableOf, of } from 'rxjs';

import { AchievementProfileComponent } from './achievement-profile.component';
import { AuthService } from 'app/core/auth/auth.service';
import { WalletService } from 'app/core/wallet/wallet.service';
import { AchievementService } from 'app/core/achievement/achievement.service';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { AngularFireModule } from '@angular/fire/compat';
import { AngularFireAuthModule } from '@angular/fire/compat/auth';
import { RouterTestingModule } from '@angular/router/testing';
import { environment } from 'environments/environment';

describe('AchievementProfileComponent', () => {
  let fixture;
  let component;

  const walletServiceMock = jasmine.createSpyObj('WalletService', ['user', 'getAccounts']);
  walletServiceMock.user = 'someone';
  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [FormsModule, ReactiveFormsModule, RouterTestingModule, AngularFireModule.initializeApp(environment.firebase), AngularFireAuthModule, HttpClientTestingModule],
      declarations: [AchievementProfileComponent],
      schemas: [CUSTOM_ELEMENTS_SCHEMA, NO_ERRORS_SCHEMA],
      providers: [{ provide: WalletService, useValue: walletServiceMock }, AuthService, WalletService, AchievementService]
    })
      .overrideComponent(AchievementProfileComponent, {})
      .compileComponents();
    fixture = TestBed.createComponent(AchievementProfileComponent);
    component = fixture.debugElement.componentInstance;
  });

  afterEach(() => {
    fixture.destroy();
  });

  it('should run #constructor()', async () => {
    expect(component).toBeTruthy();
  });

  it('should run #ngOnInit()', async () => {
    component.authService = component.authService || {};
    component.authService.user = 'user';
    spyOn(component.authService, 'signOut');
    spyOn(component, 'getAll');
    component.ngOnInit();
    expect(component.getAll).toHaveBeenCalled();
  });

  describe('get All Achievement', () => {
    it('should run #getAll()', async () => {
      component.achievementService = component.achievementService || {};
      spyOn(component.achievementService, 'byUser').and.returnValue(
        observableOf({
          data: {
            length: {}
          }
        })
      );
      component.getAll();
      expect(component.achievementService.byUser).toHaveBeenCalled();
    });
  });

  describe('setWalletAddress', () => {
    it('should set the wallet address to null if no account is recieved', () => {
      walletServiceMock.getAccounts.and.returnValue(of([]));

      component.setWalletAddress();

      expect(component.walletAddress).toEqual(null);
    });
  });
});
