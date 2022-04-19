import { WizardStage } from './../../../shared/wizard-dialog-service/wizard-stage.model';
import { WizardDialogService } from '../../../shared/wizard-dialog-service/wizard-dialog.service';
import { Component, OnInit, ViewEncapsulation, NgZone } from '@angular/core';
import { ErrorsService } from 'app/core/errors/errors.service';
import { Product } from 'app/core/product/product';
import { ProductService } from 'app/core/product/product.service';
import { WalletService } from 'app/core/wallet/wallet.service';
import { Offer } from 'app/core/models/offer.model';
import { NftUtilsService } from 'app/shared/nft-utils.service';
import { NftCardModel } from 'app/core/models/nft-card.model';

@Component({
  selector: 'landing-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss'],
  encapsulation: ViewEncapsulation.None
})
export class LandingHomeComponent implements OnInit {
  newNFTs: number = 0;
  listedForSaleNFTs: number = 0;
  soldNFTs: number = 0;
  totalUsers: number = 0;
  products: NftCardModel[] = [];
  saleNFTs: NftCardModel[] = [];
  walletAddress: string;
  loading: boolean = false;
  stats: any[] = [];

  banners = {
    bg: {
      src: 'assets/images/mcl/mcl-mascot-bg.png',
      attr: ''
    },
    text: {
      data: 'The MCL Marketplace',
      attr: 'text-transform: uppercase; text-align: left; line-height: 35px; margin: 50px 20px;'
    },
    url: ''
  };

  /**
   * Constructor
   */
  constructor(
    private _productService: ProductService,
    private _errorsService: ErrorsService,
    public walletService: WalletService,
    private ngZone: NgZone,
    private wizardService: WizardDialogService,
    private nftUtilsService: NftUtilsService
  ) {}

  ngOnInit(): void {
    this.getNFTsStats();
    //Get Account
    this.setWalletAddress();
    //Get Products
    this.getSaleNFTs();
  }

  getStats() {
    this.stats = [
      {
        img: {
          src: 'https://wax.atomichub.io/images/icons/atom.png',
          attr: ''
        },
        title: {
          text: this.newNFTs,
          attr: ''
        },
        details: {
          text: 'New NFTs',
          attr: ''
        }
      },
      {
        img: {
          src: 'https://wax.atomichub.io/images/icons/label.png',
          attr: ''
        },
        title: {
          text: this.listedForSaleNFTs,
          attr: ''
        },
        details: {
          text: 'Listed for Sale NFT',
          attr: ''
        }
      },
      {
        img: {
          src: 'https://wax.atomichub.io/images/icons/trade.png',
          attr: ''
        },
        title: {
          text: this.soldNFTs,
          attr: ''
        },
        details: {
          text: 'Sold NFTs',
          attr: ''
        }
      },
      {
        img: {
          src: 'https://wax.atomichub.io/images/icons/coins.png',
          attr: ''
        },
        title: {
          text: this.totalUsers,
          attr: ''
        },
        details: {
          text: 'Total Users',
          attr: ''
        }
      }
    ];
  }

  testWizard() {
    const stages: WizardStage[] = [
      {
        name: 'Setup',
        status: 'dormant',
        description: 'Creating the listing.'
      },
      {
        name: 'Approve',
        status: 'dormant',
        description: 'Approve our marketplace to take custody of the NFT.'
      },
      {
        name: 'Agree',
        status: 'dormant',
        description: 'Sign the message with your wallet to agree to our Terms & Conditions'
      }
    ];
    this.wizardService.showWizard('List Your NFT', stages, true);
  }

  getNFTsStats(): void {
    this._productService.getStats().subscribe(
      (data) => {
        this.newNFTs = data.data.new;
        this.listedForSaleNFTs = data.data.sale;
        this.soldNFTs = data.data.sold;
        this.totalUsers = data.data.users;
        this.getStats();
      },
      () => {
        this._errorsService.openSnackBar('Something went wrong!', 'Error');
      }
    );
  }
  getSaleNFTs(): void {
    this._productService.getAllListings().subscribe(
      (data: { data: Offer[] }) => {
        const distinctCollections = [];
        const listings = data.data.filter((listing: Offer) => listing.status === 'READY');

        listings.forEach((offer: Offer) => {
          const nftCard = this.nftUtilsService.buildNftCardFromVenlyOffer({ offer });

          if (distinctCollections.indexOf(offer.nft.contract.address) === -1) {
            distinctCollections.push(offer.nft.contract.address);
          }
          this.products.push(nftCard);
          this.saleNFTs.push(nftCard);
        });
      },
      () => {
        this._errorsService.openSnackBar('Something went wrong!', 'Error');
      }
    );
  }

  setWalletAddress() {
    this.walletService.getAccounts().subscribe((accounts) => {
      this.ngZone.run(() => {
        if (accounts.length === 0) {
          this.walletAddress = null;
        } else {
          this.walletAddress = accounts[0];
        }
      });
    });
  }

  loader(e) {
    this.loading = e;
  }
}
