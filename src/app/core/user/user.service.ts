import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, of, ReplaySubject } from 'rxjs';
import { map, tap } from 'rxjs/operators';
import { User } from 'app/core/user/user.types';
import { environment } from 'environments/environment';

const baseUrl = environment.apiUrl;

@Injectable({
  providedIn: 'root'
})
export class UserService {
  private _user: ReplaySubject<User> = new ReplaySubject<User>(1);

  /**
   * Constructor
   */
  constructor(private _httpClient: HttpClient) {}

  // -----------------------------------------------------------------------------------------------------
  // @ Accessors
  // -----------------------------------------------------------------------------------------------------

  /**
   * Setter & getter for user
   *
   * @param value
   */
  set user(value: User) {
    // Store the value
    this._user.next(value);
  }

  get user$(): Observable<User> {
    return this._user.asObservable();
  }

  // -----------------------------------------------------------------------------------------------------
  // @ Public methods
  // -----------------------------------------------------------------------------------------------------

  /**
   * Get the current logged in user data
   */
  get(): Observable<User> {
    // return this.user;
    const user = JSON.parse(localStorage.getItem('user') as string);
    return this._httpClient.post<User>(`${baseUrl}/user`, { id: user.id }).pipe(
      tap((element) => {
        this._user.next(element);
      })
    );
  }

  /**
   * Get the current logged in user data
   */
  getUserFromUsername(username: string): Observable<string> {
    return of(`${username}@megacatstudios.com`);
  }
}
