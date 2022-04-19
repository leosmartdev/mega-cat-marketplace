/* eslint-disable max-len */
import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { SharedService } from 'app/core/shared/shared.service';

@Component({
  selector: 'app-confirmation',
  templateUrl: './confirmation.component.html',
  styleUrls: ['./confirmation.component.scss']
})
export class ConfirmationComponent implements OnInit {
  products = [];
  constructor(private sharedService: SharedService, private router: Router) {}

  ngOnInit(): void {
    this.sharedService.url.next(this.router.url);
    this.products = [
      {
        name: 'hamza',
        subTotal: '20',
        price: '30',
        count: '3',
        image:
          'https://media.istockphoto.com/photos/freedom-chains-that-transform-into-birds-charge-concept-picture-id1322104312?b=1&k=20&m=1322104312&s=170667a&w=0&h=VQyPkFkMKmo0e4ixjhiOLjiRs_ZiyKR_4SAsagQQdkk='
      },
      {
        name: 'hamza',
        subTotal: '20',
        price: '30',
        count: '3',
        image: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcS7oyeIx2E_A-Z_J-mDbetsuGhw5E2OV1ORAQ&usqp=CAU'
      }
    ];
  }
}
