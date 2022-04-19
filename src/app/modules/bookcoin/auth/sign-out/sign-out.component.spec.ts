import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SignOutComponent } from './sign-out.component';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { AuthService } from 'app/core/auth/auth.service';
import { AngularFireAuthModule } from '@angular/fire/compat/auth';
import { AngularFireModule } from '@angular/fire/compat';
import { environment } from 'environments/environment';
import { Router } from '@angular/router';

describe('SignOutComponent', () => {
  let component: SignOutComponent;
  let fixture: ComponentFixture<SignOutComponent>;

  const routerMock = jasmine.createSpyObj('Router', ['navigate']);
  const authServiceMock = jasmine.createSpyObj('AuthService', ['signOut']);

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [SignOutComponent],
      imports: [HttpClientTestingModule, AngularFireModule.initializeApp(environment.firebase), AngularFireAuthModule],
      providers: [
        { provide: AuthService, useValue: authServiceMock },
        { provide: Router, useValue: routerMock }
      ]
    }).compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(SignOutComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  afterEach(() => {
    fixture.destroy();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
