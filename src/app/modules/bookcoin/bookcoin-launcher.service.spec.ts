import { TestBed } from '@angular/core/testing';

import { BookcoinLauncherService } from './bookcoin-launcher.service';

describe('BookcoinLauncherService', () => {
  let service: BookcoinLauncherService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(BookcoinLauncherService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
