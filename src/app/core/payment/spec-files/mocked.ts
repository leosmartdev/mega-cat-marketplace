const billingDetails = {
  name: '',
  line1: '',
  line2: '',
  city: '',
  postalCode: '',
  district: '',
  country: ''
};

const verificationDetails = {
  cvv: '123',
  avs: '12435'
};

const metadataDetails = {
  phoneNumber: '12345467',
  email: 'test@xyz.com'
};

export const mockedCardPaymentResponse = {
  id: '1',
  status: '',
  last4: '4444',
  billingDetails: billingDetails,
  expMonth: 2,
  expYear: 2030,
  network: '',
  bin: '',
  issuerCountry: 'abc',
  fundingType: '',
  fingerprint: '',
  verification: verificationDetails,
  createDate: '',
  metadata: metadataDetails,
  updateDate: ''
};

export const mockedPaymentCard = {
  ...billingDetails,
  expMonth: 2,
  expYear: 2030,
  cardNumber: '123456789012',
  csv: '123',
  saveCard: false,
  selectedCard: false
};
