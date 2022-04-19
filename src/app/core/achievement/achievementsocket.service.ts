import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import Client, { Socket as ClientSocket } from 'socket.io-client';

import { AuthService } from '../auth/auth.service';
import Swal from 'sweetalert2';

@Injectable({
  providedIn: 'root'
})
export class AchievementSocketService {
  private socket: ClientSocket;
  private baseUrl = environment.apiUrl;

  // eslint-disable-next-line no-bitwise
  constructor(private authService: AuthService) {}

  setupSocketConnection(userId: string) {
    this.socket = Client(`${this.baseUrl}/achievement/`, {
      transports: ['websocket'],
      query: { token: this.authService.accessToken, userId }
    });

    this.socket.on('connect_error', (err) => {
      console.log('socket:connect_error: ', err.message);
    });

    this.socket.on('connect', () => {});

    const observableNewAchievement = new Observable<any>((observer) => {
      this.socket.on('newAchievement', (achievement) => {
        const toast = Swal.mixin({
          toast: true,
          position: 'center',
          showConfirmButton: false,
          timer: 5000,
          background: '#5b5353',
          iconColor: 'white'
        });
        toast.fire({
          icon: 'success',
          title: `<p class='text-white'>You have just achieved <b>${achievement.title}</b><br>${achievement.actionTaken}</p>`
        });
        // Swal.fire({
        //   icon: 'info',
        //   title: `<p class='text-white'>You have just achieved <b>${achievement.title}</b><br>${achievement.actionTaken}</p>`,
        //   showConfirmButton: false,
        //   timer: 2000,
        //   background: '#5b5353',
        //   iconColor: 'white'
        // });
        observer.next(achievement);
      });
    });

    return { observableNewAchievement };
  }

  disconnectSocket = () => this.socket.disconnect();
}
