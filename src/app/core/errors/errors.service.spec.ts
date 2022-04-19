import { TestBed } from '@angular/core/testing';
import { ErrorsService } from './errors.service';
import { MatSnackBarModule } from '@angular/material/snack-bar';

describe('ErrorsService', () => {
  let service: ErrorsService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [MatSnackBarModule],
      providers: [{ provide: ErrorsService }]
    });
    service = TestBed.inject(ErrorsService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should open the Snack Bar', () => {
    const message = 'Test error';
    const action = 'Do something';
    const spySnack = spyOn((service as any).snackBar, 'open');

    service.openSnackBar(message, action);

    expect(spySnack).toHaveBeenCalledTimes(1);
  });

  it('should open the Top Snack Bar', () => {
    const message = 'Test error';
    const action = 'Do something';
    const spySnack = spyOn((service as any).snackBar, 'open');
    const options = { panelClass: ['opened-snackbar-modal', 'success'], duration: 2000, horizontalPosition: 'center', verticalPosition: 'top' };

    service.openSnackBarTop(message, action);

    expect(spySnack).toHaveBeenCalledOnceWith(message, action, options);
  });
});
