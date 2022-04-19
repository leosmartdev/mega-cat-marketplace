import { ComponentFixture, TestBed } from '@angular/core/testing';
import { AuthService } from 'app/core/auth/auth.service';
import { AvatarPopupComponent } from './avatar-popup.component';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { RouterTestingModule } from '@angular/router/testing';
import { BsModalService } from 'ngx-bootstrap/modal';
import { FormBuilder } from '@angular/forms';
import { of } from 'rxjs';
import { Router } from '@angular/router';
import { mockUser } from 'app/core/auction/spec-files/mocked';

describe('AvatarPopupComponent', () => {
  let component: AvatarPopupComponent;
  let fixture: ComponentFixture<AvatarPopupComponent>;
  const authServiceMock = jasmine.createSpyObj('AuthService', ['firebaseSignUp', 'firebaseSignIn', 'firebaseSignInWithGoogle', 'updateAvatar', 'removeAvatar', 'user']);
  authServiceMock.user = mockUser;
  const modalserviceMock = jasmine.createSpyObj('BsModalService', ['hide']);
  const routerMock = jasmine.createSpyObj('Router', ['navigateByUrl']);

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [AvatarPopupComponent],
      imports: [HttpClientTestingModule, RouterTestingModule],
      providers: [{ provide: AuthService, useValue: authServiceMock }, { provide: BsModalService }, { provide: FormBuilder }, { provide: Router, useValue: routerMock }]
    }).compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(AvatarPopupComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should update avatar sucessfully', () => {
    const spyupdateAvatar = authServiceMock.updateAvatar.and.returnValue(of());
    const spyNavigate = routerMock.navigateByUrl.and.callFake((url) => {});
    const updateForm = new FormData();
    const imageMock = 'test.png';
    component.updateAvatarForm.value.image = imageMock;
    updateForm.append('avatar', imageMock);

    component.updateAvatar();

    expect(spyupdateAvatar).toHaveBeenCalledWith(updateForm);
    expect(spyNavigate).toHaveBeenCalledWith('/profile');
  });

  it('should remove Avatar', () => {
    const spyRemoveAvatar = authServiceMock.removeAvatar.and.returnValue(of());

    component.removeAvatar();

    expect(spyRemoveAvatar).toHaveBeenCalledTimes(1);
  });

  it('should get the user correctly', () => {
    const res = component.getUser();

    expect(res).toEqual(mockUser);
  });

  it('should set the image on change', () => {
    const mockEvent = {
      target: {
        files: ['test.png']
      }
    };

    component.onChange(mockEvent);

    expect(component.updateAvatarForm.value.image).toEqual(mockEvent.target.files[0]);
  });
});
