// tslint:disable
import { TestBed } from '@angular/core/testing';
import { CUSTOM_ELEMENTS_SCHEMA, NO_ERRORS_SCHEMA } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { of as observableOf, of } from 'rxjs';

import { AchievementLandingComponent } from './achievement-landing.component';
import { AuthService } from 'app/core/auth/auth.service';
import { AchievementService } from 'app/core/achievement/achievement.service';
import { WalletService } from 'app/core/wallet/wallet.service';
import { RouterTestingModule } from '@angular/router/testing';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { AngularFireModule } from '@angular/fire/compat';
import { AngularFireAuthModule } from '@angular/fire/compat/auth';
import { environment } from 'environments/environment';

describe('AchievementLandingComponent', () => {
  let fixture;
  let component;

  const walletServiceMock = jasmine.createSpyObj('WalletService', ['user', 'getAccounts']);
  walletServiceMock.user = 'someone';
  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [FormsModule, ReactiveFormsModule, RouterTestingModule, AngularFireModule.initializeApp(environment.firebase), AngularFireAuthModule, HttpClientTestingModule],
      declarations: [AchievementLandingComponent],
      schemas: [CUSTOM_ELEMENTS_SCHEMA, NO_ERRORS_SCHEMA],
      providers: [{ provide: WalletService, useValue: walletServiceMock }, AuthService, AchievementService, WalletService]
    })
      .overrideComponent(AchievementLandingComponent, {})
      .compileComponents();
    fixture = TestBed.createComponent(AchievementLandingComponent);
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
    spyOn(component, 'getAllAchievements');
    spyOn(component, 'getMyAchievementList');
    component.ngOnInit();
    expect(component.getAllAchievements).toHaveBeenCalled();
    expect(component.getMyAchievementList).toHaveBeenCalled();
  });

  describe('get All Achievements', () => {
    it('should run #getAllAchievements()', async () => {
      component.achievementService = component.achievementService || {};
      spyOn(component.achievementService, 'byUser').and.returnValue(
        observableOf({
          data: {
            length: {}
          },
          last7dayCount: {},
          lastMonthCount: {}
        })
      );
      component.getAllAchievements();
      component.getMyAchievementList();
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
