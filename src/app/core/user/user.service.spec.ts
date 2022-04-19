import { TestBed } from '@angular/core/testing';

import { UserService } from './user.service';
import { HttpClient, HttpHandler } from '@angular/common/http';
import { HttpClientModule } from '@angular/common/http';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { Observable, of, ReplaySubject } from 'rxjs';
import { map, tap } from 'rxjs/operators';
import { User } from 'app/core/user/user.types';
import { Role } from '../models/role';
import { environment } from 'environments/environment';
import { url } from 'inspector';

const baseUrl = environment.apiUrl;

describe('UserService', () => {
  let service: UserService;
  let httpTestingController: HttpTestingController;
  const user: User = {
    id: '123',
    _id: '123',
    name: 'test user',
    bio: 'Some info',
    email: 'testuser@xyz.com',
    role: Role.User
  };

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientModule, HttpClientTestingModule],
      providers: [{ provide: UserService }]
    });
    service = TestBed.inject(UserService);
    httpTestingController = TestBed.get(HttpTestingController);
    let store = {};
    const mockLocalStorage = {
      getItem: (key: string): string => (key in store ? store[key] : null),
      setItem: (key: string, value: string) => {
        store[key] = `${value}`;
      },
      removeItem: (key: string) => {
        delete store[key];
      },
      clear: () => {
        store = {};
      }
    };

    spyOn(localStorage, 'getItem').and.callFake(mockLocalStorage.getItem);
    spyOn(localStorage, 'setItem').and.callFake(mockLocalStorage.setItem);
    spyOn(localStorage, 'removeItem').and.callFake(mockLocalStorage.removeItem);
    spyOn(localStorage, 'clear').and.callFake(mockLocalStorage.clear);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  describe('User', () => {
    it('should set the user successfully', () => {
      const getSpy = spyOnProperty(service, 'user', 'set').and.callThrough();
      service.user = user;
      expect(getSpy).toHaveBeenCalledTimes(1);
      expect(getSpy).toHaveBeenCalledWith(user);
    });

    it('should get the user sucessfully', () => {
      const getSpy = spyOnProperty(service, 'user$', 'get').and.callThrough();
      expect(service.user$).toBeTruthy();
      expect(getSpy).toHaveBeenCalledTimes(1);
    });

    it('should get a user from username', () => {
      const username = 'test123';
      service.getUserFromUsername(username).subscribe((res) => {
        expect(res).toEqual('test123@megacatstudios.com');
      });
    });
    it('should return the user correctly', () => {
      const testUrl = `${baseUrl}/user`;
      localStorage.setItem('user', JSON.stringify(user));
      const expectedResponse = user;
      service.get().subscribe((res) => {
        expect(res).toBeTruthy();
        expect(res).toEqual(expectedResponse);
      });
      const requestWrapper = httpTestingController.expectOne({ url: testUrl });
      expect(requestWrapper.request.method).toEqual('POST');
      requestWrapper.flush(expectedResponse);
      httpTestingController.verify();
    });
  });
});
