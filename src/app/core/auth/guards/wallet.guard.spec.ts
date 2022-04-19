import { TestBed } from '@angular/core/testing';
import { ActivatedRouteSnapshot, Route, Router, RouterStateSnapshot, UrlSegment } from '@angular/router';
import { RouterTestingModule } from '@angular/router/testing';
import { of } from 'rxjs';

import { WalletGuard } from './wallet.guard';
import { WalletService } from '../../wallet/wallet.service';

describe('WalletGuard', () => {
  let guard: WalletGuard;
  const walletServiceMock = jasmine.createSpyObj('WalletService', ['isWalletActive']);
  const routerMock = jasmine.createSpyObj('Router', ['navigate']);

  const route: ActivatedRouteSnapshot = new ActivatedRouteSnapshot();
  const state: RouterStateSnapshot = {
    url: 'url@test.xyz',
    root: route
  };

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [RouterTestingModule],
      providers: [
        { provide: WalletService, useValue: walletServiceMock },
        { provide: Router, useValue: routerMock }
      ]
    });

    guard = TestBed.inject(WalletGuard);
    walletServiceMock.isWalletActive.and.returnValue(true);
    routerMock.navigate.and.returnValue(of(false));
  });

  it('should be created', () => {
    expect(guard).toBeTruthy();
  });

  describe('canActivate', () => {
    it('should return true', () => {
      const spyCheck = spyOn<any>(guard, 'check').and.callThrough();
      const res = guard.canActivate(route, state);

      expect(spyCheck).toHaveBeenCalledTimes(1);
      expect(res).toEqual(true);
    });

    it('should return false', () => {
      walletServiceMock.isWalletActive.and.returnValue(false);
      const spyCheck = spyOn<any>(guard, 'check').and.callThrough();
      const res = guard.canActivate(route, state);

      expect(spyCheck).toHaveBeenCalledTimes(1);
      expect(res).toEqual(false);
    });
  });

  describe('canActivateChild', () => {
    it('should return true', () => {
      const spyCheck = spyOn<any>(guard, 'check').and.callThrough();
      const res = guard.canActivateChild(route, state);

      expect(spyCheck).toHaveBeenCalledTimes(1);
      expect(res).toEqual(true);
    });

    it('should return false', () => {
      walletServiceMock.isWalletActive.and.returnValue(false);
      const spyCheck = spyOn<any>(guard, 'check').and.callThrough();
      const res = guard.canActivateChild(route, state);

      expect(spyCheck).toHaveBeenCalledTimes(1);
      expect(res).toEqual(false);
    });
  });

  describe('canDeactivate', () => {
    it('should return true', () => {
      const currentState: RouterStateSnapshot = {
        url: 'currentUrl@test.xyz',
        root: route
      };
      const nextState: RouterStateSnapshot = {
        url: 'nextUrl@test.xyz',
        root: route
      };
      const spyDeactivate = spyOn<any>(guard, 'canDeactivate').and.callThrough();
      const res = guard.canDeactivate({}, route, currentState, nextState);

      expect(res).toEqual(true);
      expect(spyDeactivate).toHaveBeenCalledTimes(1);
    });
  });

  describe('canLoad', () => {
    it('should return true', () => {
      const routeObj: Route = {};
      const segments: UrlSegment[] = [];
      const spyLoad = spyOn<any>(guard, 'canLoad').and.callThrough();
      const res = guard.canLoad(routeObj, segments);

      expect(res).toEqual(true);
      expect(spyLoad).toHaveBeenCalledTimes(1);
    });
  });
});
