import { ComponentFixture, TestBed } from '@angular/core/testing';
import { of } from 'rxjs';
import { DropService } from '../drop.service';
import { AuthService } from 'app/core/auth/auth.service';
import { LandingDropComponent } from './landing.component';
import { mockedNftDrop } from '../spec-files/mocked';

describe('LandingComponent', () => {
  let component: LandingDropComponent;
  let fixture: ComponentFixture<LandingDropComponent>;
  const dropsResponse = {
    message: 'Get Drops Successfully!',
    data: [mockedNftDrop]
  };
  const dropServiceMock = jasmine.createSpyObj('DropService', ['fetchDrops']);
  dropServiceMock.fetchDrops.and.returnValue(of(dropsResponse));
  const authService = jasmine.createSpyObj('AuthService', ['isAdmin']);
  authService.isAdmin.and.returnValue(false);

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [LandingDropComponent],
      providers: [
        { provide: DropService, useValue: dropServiceMock },
        { provide: AuthService, useValue: authService }
      ]
    }).compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(LandingDropComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
