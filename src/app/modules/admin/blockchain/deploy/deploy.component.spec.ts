import { ComponentFixture, TestBed } from '@angular/core/testing';
import { AuthService } from 'app/core/auth/auth.service';

import { DeployComponent } from './deploy.component';

describe('DeployComponent', () => {
  let component: DeployComponent;
  let fixture: ComponentFixture<DeployComponent>;
  const authService = jasmine.createSpyObj('AuthService', ['isSuperAdmin']);
  authService.isSuperAdmin.and.returnValue(true);

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [DeployComponent],
      providers: [{ provide: AuthService, useValue: authService }]
    }).compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(DeployComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
