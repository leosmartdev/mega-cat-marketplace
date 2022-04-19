export class CardPaymentResponse {
  id: string;
  status: string;
  last4: string;
  billingDetails: BillingDetails;
  expMonth: number;
  expYear: number;
  network;
  bin;
  issuerCountry;
  fundingType;
  fingerprint;
  verification: VerificationDetails;
  createDate;
  metadata: MetadataDetails;
  updateDate;
}

class BillingDetails {
  name;
  line1;
  line2;
  city;
  postalCode;
  district;
  country;
}

class VerificationDetails {
  cvv;
  avs;
}

class MetadataDetails {
  phoneNumber;
  email;
}
