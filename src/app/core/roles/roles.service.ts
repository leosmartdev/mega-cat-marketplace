import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { environment } from 'environments/environment';
import { AuthService } from '../auth/auth.service';
const baseUrl = environment.apiUrl;

@Injectable({
  providedIn: 'root'
})
export class RolesService {
  constructor(private httpClient: HttpClient, private authService: AuthService) {}

  listUsers(data): Observable<any> {
    return this.httpClient.post(`${baseUrl}/role/getUsers/`, data, {
      headers: this.authService.getAuthHeader()
    });
  }

  makeAdmin(data): Observable<any> {
    return this.httpClient.post(`${baseUrl}/role/admin`, data, {
      headers: this.authService.getAuthHeader()
    });
  }
  revokeAdminRole(data): Observable<any> {
    return this.httpClient.post(`${baseUrl}/role/user`, data, {
      headers: this.authService.getAuthHeader()
    });
  }

  listAdmins(): Observable<any> {
    return this.httpClient.get(`${baseUrl}/role/getAdmins`, {
      headers: this.authService.getAuthHeader()
    });
  }

  getPendingPayouts(): Observable<any> {
    return this.httpClient.get(`${baseUrl}/payouts/pending`, {
      headers: this.authService.getAuthHeader()
    });
  }

  approveAllPayouts(data): Observable<any> {
    return this.httpClient.post(`${baseUrl}/payouts/approveAllPayouts`, data, {
      headers: this.authService.getAuthHeader()
    });
  }
  approvePayout(data): Observable<any> {
    return this.httpClient.post(`${baseUrl}/payouts/approve`, data, {
      headers: this.authService.getAuthHeader()
    });
  }

  getPayoutsByWalletAddress(data): Observable<any> {
    return this.httpClient.post(`${baseUrl}/payouts/walletAddress`, data, {
      headers: this.authService.getAuthHeader()
    });
  }

  getUserBalanceByWalletAddress(): Observable<any> {
    return this.httpClient.get(`${baseUrl}/payouts/getBalance`, {
      headers: this.authService.getAuthHeader()
    });
  }

  transferBalanceToUserMetamaskWallet(data): Observable<any> {
    return this.httpClient.post(`${baseUrl}/payouts/transferCircleToUserWallet`, data, {
      headers: this.authService.getAuthHeader()
    });
  }
}
