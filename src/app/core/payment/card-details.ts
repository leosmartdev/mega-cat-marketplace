export class CardDetails {
  // eslint-disable-next-line id-blacklist
  number?: string; // required when storing card details
  cvv?: string; // required when cardVerification is set to cvv or three_d_secure

  constructor(cardNumber, cvv) {
    // eslint-disable-next-line id-blacklist
    this.number = cardNumber;
    this.cvv = cvv;
  }
}
