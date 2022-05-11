import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { CartService } from 'app/core/cart/cart.service';
import { SharedService } from 'app/core/shared/shared.service';
import { PaymentService } from 'app/core/payment/payment.service';

@Component({
  selector: 'app-checkout',
  templateUrl: './checkout.component.html',
  styleUrls: ['./checkout.component.scss']
})
export class CheckoutComponent implements OnInit {
  checkoutForm: FormGroup;
  public cards: [] = [];
  paymentType: string;
  isAgree: boolean = false;

  constructor(
    private sharedService: SharedService,
    private paymentService: PaymentService,
    private cartService: CartService,
    private router: Router,
    private formBuilder: FormBuilder,
    private activatedRoute: ActivatedRoute
  ) {}

  ngOnInit(): void {
    this.getUserCards();
    this.sharedService.url.next(this.router.url);
    this.paymentType = this.activatedRoute.snapshot.params['paymentType'];

    // Checkout form
    this.checkoutForm = this.formBuilder.group({
      selectedCard: null,
      name: [null, Validators.required],
      city: [null, Validators.required],
      country: [null, Validators.required],
      line1: [null, Validators.required],
      line2: [null, Validators.required],
      district: [null, Validators.required],
      postalCode: [null, Validators.required],
      cardNumber: [null, Validators.required],
      expiryMonth: [null, Validators.required],
      expiryYear: [null, Validators.required],
      csv: [null, Validators.required],
      saveCard: false
    });
  }

  getUserCards(): void {
    this.cartService.getCards().subscribe((data: any) => {
      this.cards = data.data;
    });
  }
  /*eslint-disable */
  ProceedToOrder() {
    /*eslint-enable */
    if (this.checkoutForm.invalid) {
      return;
    }
    const card = this.checkoutForm.value;

    this.paymentService.card = card;
    this.router.navigateByUrl(`order-completed/${this.paymentType}`);
  }

  fillTestData() {
    this.checkoutForm.controls.name.setValue('John Snow');
    this.checkoutForm.controls.city.setValue('Beaver Falls');
    this.checkoutForm.controls.country.setValue('US');
    this.checkoutForm.controls.line1.setValue('500 Baum Blvd');
    this.checkoutForm.controls.line2.setValue('500 Baum Blvd');
    this.checkoutForm.controls.district.setValue('US');
    this.checkoutForm.controls.postalCode.setValue('15222');
    this.checkoutForm.controls.expiryMonth.setValue(1);
    this.checkoutForm.controls.cardNumber.setValue('4007400000000007');
    this.checkoutForm.controls.csv.setValue(123);
    this.checkoutForm.controls.expiryYear.setValue(2023);
  }

  selectSavedCard(event) {
    const card = event.value;
    this.checkoutForm.controls.selectedCard.setValue(card.cardId);
    this.checkoutForm.controls.expiryMonth.setValue(card.expMonth);
    this.checkoutForm.controls.cardNumber.setValue(card.cardNumber);
    this.checkoutForm.controls.expiryYear.setValue(card.expYear);
    this.checkoutForm.controls.name.setValue(card.name);
    this.checkoutForm.controls.city.setValue(card.city);
    this.checkoutForm.controls.country.setValue(card.country);
    this.checkoutForm.controls.line1.setValue(card.line1);
    this.checkoutForm.controls.line2.setValue(card.line2);
    this.checkoutForm.controls.district.setValue(card.district);
    this.checkoutForm.controls.postalCode.setValue(card.postalCode);
  }
}
