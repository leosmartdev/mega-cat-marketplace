export class VenlyCollectionResponseModel {
  name: string;
  description: string;
  confirmed: boolean;
  id: number;
  secretType: string;
  symbol: string;
  externalUrl: string;
  image: string;
  media: Media[];
  transactionHash: string;
  // eslint-disable-next-line @typescript-eslint/naming-convention
  external_link: string;
}

class Media {
  type: string;
  value: string;
}
