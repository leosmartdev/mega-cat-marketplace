import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class SharedService {
  public url: BehaviorSubject<string> = new BehaviorSubject<string>('/home');
}
