import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { AuthService } from '../auth/auth.service';
import { environment } from 'environments/environment';
import { Observable } from 'rxjs';
import { Reward } from './rewards';

const baseUrl = environment.apiUrl;
const rewardsApi = `${baseUrl}/rewards`;

@Injectable({
  providedIn: 'root'
})
export class RewardsService {
  constructor(private httpClient: HttpClient, private authService: AuthService) {}

  listRewards = (): Observable<Reward[]> => this.httpClient.get<Reward[]>(rewardsApi, { headers: this.authService.getAuthHeader() });

  createReward = (data: FormData): Observable<Reward> => {
    if (!data.has('markdown')) {
      throw new Error('Reward markdown is not present');
    }

    if (!data.has('title')) {
      throw new Error('Reward title is not present');
    }

    return this.httpClient.post<Reward>(rewardsApi, data, { headers: this.authService.getAuthHeader() });
  };

  listUserRewards = (): Observable<Reward[]> => this.httpClient.get<Reward[]>(`${rewardsApi}/user`, { headers: this.authService.getAuthHeader() });

  listUnassignedRewards = (): Observable<Reward[]> => this.httpClient.get<Reward[]>(`${rewardsApi}/getUnassigned`, { headers: this.authService.getAuthHeader() });

  getResource = (link: string) => this.httpClient.get(`${baseUrl}/${link}`, { headers: this.authService.getAuthHeader(), observe: 'response', responseType: 'blob' });
}
