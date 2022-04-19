export class BillingDetails {
  // eslint-disable-next-line id-blacklist
  savedCardId: string;
  name: string;
  city: string;
  country: string;
  line1: string;
  line2: string;
  district: string;
  postalCode: string;
  amount: number;
  expMonth: number;
  expYear: number;

  constructor(savedCardId, name, city, country, line1, line2, district, postalCode, amount, expMonth, expYear) {
    // eslint-disable-next-line id-blacklist
    this.savedCardId = savedCardId;
    this.name = name;
    this.city = city;
    this.country = country;
    this.line1 = line1;
    this.line2 = line2;
    this.district = district;
    this.postalCode = postalCode;
    this.amount = amount;
    this.expMonth = expMonth;
    this.expYear = expYear;
  }
}
