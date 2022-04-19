import { TestBed } from '@angular/core/testing';

import { RouteMonitorService } from './route-monitor.service';
import { NavigationEnd, Router } from '@angular/router';
import { Observable } from 'rxjs';

describe('RouteMonitorService', () => {
  let service: RouteMonitorService;
  const routerMock = jasmine.createSpyObj('Router', ['url', 'events']);
  routerMock.url.and.returnValue('aUrl');
  routerMock.events = new Observable((observer) => {
    observer.next(new NavigationEnd(123, 'test', 'test'));
  });

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [{ provide: Router, useValue: routerMock }]
    });
    service = TestBed.inject(RouteMonitorService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should return previous url', () => {
    (service as any).previousUrl = 'test Url';

    expect(service.getPreviousUrl()).toEqual('test Url');
  });
});
