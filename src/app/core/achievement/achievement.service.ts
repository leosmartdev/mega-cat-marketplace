import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class AchievementService {
  baseUrl = environment.apiUrl;

  // eslint-disable-next-line no-bitwise
  constructor(private _httpClient: HttpClient) {}

  byUser(): Observable<any> {
    const user = JSON.parse(localStorage.getItem('user') as string);
    console.log(user);
    let id = '';
    if (user) {
      id = user.id;
    }
    return this._httpClient.post(`${this.baseUrl}/achievement/user`, { id: id });
  }

  getByAchieveId(achieveId): Observable<any> {
    const user = JSON.parse(localStorage.getItem('user') as string);
    console.log(user);
    let id = '';
    if (user) {
      id = user.id;
    }
    return this._httpClient.post(`${this.baseUrl}/achievement/user/${achieveId}`, { id: id });
  }

  getAll(): Observable<any> {
    return this._httpClient.get(`${this.baseUrl}/achievement/`);
  }

  create(data): Observable<any> {
    return this._httpClient.post(`${this.baseUrl}/achievement/`, data);
  }

  update(id, data): Observable<any> {
    return this._httpClient.patch(`${this.baseUrl}/achievement/${id}`, data);
  }
}
