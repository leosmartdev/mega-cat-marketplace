import { TestBed } from '@angular/core/testing';

import { JQueryService } from './jquery.service';

describe('JqueryService', () => {
  let service: JQueryService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(JQueryService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should resize the text area', () => {
    const event = {
      target: {
        style: {
          height: '10px'
        },
        scrollHeight: '20'
      }
    };

    service.resizeTextarea(event);

    expect(event.target.style.height).toEqual(event.target.scrollHeight + 'px');
  });

  it('should create dynamic text areas', () => {
    const spyExecute = spyOn(service, 'execute').and.callThrough();

    service.setDynamicTextareas('body');

    expect(spyExecute).toHaveBeenCalledTimes(1);
  });
});
