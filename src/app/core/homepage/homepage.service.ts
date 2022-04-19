import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { environment } from 'environments/environment';
const baseUrl = environment.apiUrl;

@Injectable()
export class HomepageService {
  constructor(private httpClient: HttpClient) {}

  getDrops(): Observable<any> {
    return this.httpClient.get(`${baseUrl}/drops/`);
  }

  getNews(): Observable<any> {
    return this.httpClient.get(`${baseUrl}/news/index/`);
  }

  getTeam(): Observable<any> {
    return this.httpClient.get(`${baseUrl}/teams/index/`);
  }
  getFAQ(): Observable<any> {
    return this.httpClient.get(`${baseUrl}/faqs/index/`);
  }
}
