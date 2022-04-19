export class BillingResponse {
  // eslint-disable-next-line id-blacklist
  status: string;
  description: string;

  constructor(status: string, description: string) {
    // eslint-disable-next-line id-blacklist
    this.status = status;
    this.description = description;
  }
}
