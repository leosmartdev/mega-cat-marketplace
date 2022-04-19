import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import Client, { Socket as ClientSocket } from 'socket.io-client';
import Swal from 'sweetalert2';

import { environment } from 'environments/environment';

import { Offer } from '../models/offer.model';
import { AuthService } from '../auth/auth.service';
import { AuctionBid, AuctionExpireResponse, AuctionPayload, AuctionResponse, NftAuctionResponse } from './auction';

const baseUrl = environment.apiUrl;
const auctionApi = `${baseUrl}/auctions`;

@Injectable({
  providedIn: 'root'
})
export class AuctionService {
  private socket: ClientSocket;
  constructor(private httpClient: HttpClient, private authService: AuthService) {}

  setupSocketConnection(auctionId: string) {
    this.socket = Client(baseUrl, {
      transports: ['websocket'],
      query: { token: this.authService.accessToken, auctionId }
    });

    this.socket.on('connect_error', (err) => {
      console.log('socket:connect_error: ', err.message);
    });

    this.socket.on('connect', () => {});

    const observableNewBid = new Observable<AuctionBid>((observer) => {
      this.socket.on('newBid', (bid) => {
        const toast = Swal.mixin({
          toast: true,
          position: 'top-right',
          showConfirmButton: false,
          timer: 2000,
          background: '#5b5353',
          iconColor: 'white'
        });
        toast.fire({
          icon: 'info',
          title: `<p class='text-white'>${bid.userId.name} placed a new bid of ${bid.bidAmount} on this auction</p>`
        });
        observer.next(bid);
      });
    });

    const observableExpireAuction = new Observable<AuctionExpireResponse>((observer) => {
      this.socket.on('expireAuction', (expired) => {
        Swal.fire({
          icon: 'info',
          title: `<p class='text-white'>Auction is expired now <br /> Winner: ${expired.winnerId?.name || 'No Winner'}</p>`,
          showConfirmButton: false,
          timer: 2000,
          background: '#5b5353',
          iconColor: 'white'
        });

        observer.next(expired);
      });
    });

    return { observableNewBid, observableExpireAuction };
  }
  disconnectSocket = () => this.socket.disconnect();

  create({ offerId, expirationTime, startingBid }: AuctionPayload) {
    if (!offerId) {
      throw new Error('Auction offerId is not present');
    }

    if (!expirationTime) {
      throw new Error('Auction expirationTime is not present');
    }

    if (!startingBid) {
      throw new Error('Auction startingBid is not present');
    }

    return this.httpClient.post<AuctionResponse>(auctionApi, { offerId, expirationTime, startingBid }, { headers: this.authService.getAuthHeader() });
  }

  getOnGoingAuctions = () => this.httpClient.get<{ data: Offer[] }>(auctionApi, { headers: this.authService.getAuthHeader() });

  getAllCreatedByUser = () => this.httpClient.get<{ data: Offer[] }>(`${auctionApi}/user`, { headers: this.authService.getAuthHeader() });

  getAllParticipatedByUser = () => this.httpClient.get<{ data: Offer[] }>(`${auctionApi}/participated`, { headers: this.authService.getAuthHeader() });

  getOne(id: string) {
    if (!id) {
      throw new Error('Auction id is not present');
    }

    return this.httpClient.get<NftAuctionResponse>(`${auctionApi}/${id}`, { headers: this.authService.getAuthHeader() });
  }

  addBid = (bidAmount: number, id: string, ignore: boolean) => {
    if (!id) {
      throw new Error('Auction id is not present');
    }

    if (!bidAmount) {
      throw new Error('Bid amount is not present');
    }

    return this.httpClient.post<AuctionResponse>(`${auctionApi}/${id}/bid`, { bidAmount, ignore }, { headers: this.authService.getAuthHeader() });
  };

  disclaimTopBid = (id: string) => {
    if (!id) {
      throw new Error('Auction id is not present');
    }

    return this.httpClient.post<AuctionResponse>(`${auctionApi}/${id}/disclaim`, {}, { headers: this.authService.getAuthHeader() });
  };
}
