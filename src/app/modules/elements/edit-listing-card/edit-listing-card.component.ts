import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
import { ProductService } from 'app/core/product/product.service';
import { VenlyService } from 'app/core/venly/venly.service';
import { ErrorsService } from 'app/core/errors/errors.service';
import { CartService } from 'app/core/cart/cart.service';
import { WizardDialogService } from 'app/shared/wizard-dialog-service/wizard-dialog.service';
import { WizardStage } from 'app/shared/wizard-dialog-service/wizard-stage.model';
import { OfferCreatedResponseModel } from 'app/core/models/offer-created-response.model';
import { Router } from '@angular/router';
import { NftProduct } from 'app/core/models/nft-product.model';
import { NftUtilsService } from 'app/shared/nft-utils.service';

@Component({
  selector: 'app-edit-listing-card',
  templateUrl: './edit-listing-card.component.html',
  styleUrls: ['./edit-listing-card.component.scss']
})
export class EditListingCardComponent implements OnInit {
  @Input() nft: NftProduct | any;
  @Input() walletAddress: any;
  @Output() loading = new EventEmitter();
  offer: any;
  activeNft: any = '';
  constructor(
    private productService: ProductService,
    private errorsService: ErrorsService,
    private venlyService: VenlyService,
    private cartService: CartService,
    private nftUtilsService: NftUtilsService,
    private wizardService: WizardDialogService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.offer = this.nft;
    this.nft = this.nft.nft;
    this.nft.type = this.offer.type;
  }

  listForSale(nft) {
    const chain = this.nft.chain ?? 'mumbai';
    const formdata = new FormData();
    const self = this;
    formdata.append('tokenId', nft.tokenId);
    formdata.append('address', nft.metadata.contract.address);
    formdata.append('sellerAddress', this.walletAddress);
    formdata.append('price', nft.price);
    formdata.append('chain', chain);

    this.showWizardDialog();

    this.productService.createForSale(formdata).subscribe(
      async (response) => {
        this.wizardService.advanceStages();
        const offerId = response.data.offerId;
        if (response.data.transaction.length === 0) {
          console.log('No approval needed!');
        } else {
          const nftContractAddress = this.nft.contract.address;
          const result = await self.venlyService.updateOfferWithApproval(nftContractAddress, response.data);
        }
        this.wizardService.advanceStages();

        await self.venlyService.updateOfferWithSignature(offerId);
        this.wizardService.advanceStages();
        nft.type = 'listing-pending';
        this.activeNft = '';
      },
      (error) => {
        this.wizardService.setError(error);
        self.errorsService.openSnackBar('Something went wrong!', 'Error');
      }
    );
  }

  cancelListing() {
    this.productService
      .cancelListing({
        offerId: this.offer.id
      })
      .subscribe(
        (data) => {
          console.log('listing cancelled succesfully', data);
          this.errorsService.openSnackBar('Listing Cancelled Succesfully', 'Success');
          this.router.navigateByUrl('/market');
        },
        () => {
          console.log('failed to cancel listing');
          this.errorsService.openSnackBar('Failed to cancel listing', 'Error');
        }
      );
  }
  editListing() {
    if (this.offer.price < 0.5) {
      this.errorsService.openSnackBar('Minimum listing price is 0.5', 'Error');
      this.offer.price = 0.5;

      return;
    }
    this.productService
      .editListing({
        offerId: this.offer.id,
        price: this.offer.price
      })
      .subscribe(
        (data) => {
          console.log('listing edited succesfully', data);
          this.errorsService.openSnackBar('Listing Edited Succesfully', 'Success');
          this.activeNft = '';
          this.router.navigateByUrl('/market');
        },
        () => {
          console.log('failed to edit listing');
          this.errorsService.openSnackBar('Failed to edit listing', 'Error');
        }
      );
  }

  timer(value: number) {
    const hours: number = Math.floor(value / 3600);
    const minutes: number = Math.floor((value % 3600) / 60);
    return ('00' + hours).slice(-2) + ':' + ('00' + minutes).slice(-2) + ':' + ('00' + Math.floor(value - minutes * 60)).slice(-2);
  }

  addToCart(saleNFT: any) {
    // TODO: Make this a Product and fix tests and code.
    const item = {
      _id: saleNFT.id,
      count: 1,
      image: saleNFT.nft.imageUrl,
      name: saleNFT.nft.name,
      price: saleNFT.price,
      sellerAddress: saleNFT.sellerAddress,
      smartContractAddress: saleNFT.nft.contract.address,
      subTotal: saleNFT.price,
      tokenId: saleNFT.nft.tokenId
    };

    this.cartService.addItemToCart(item);
  }

  imageError(nft) {
    console.warn('Couldnt load original image; replacing will fallback.');
    nft.imageUrl = this.nftUtilsService.getFallbackImage();
  }

  private showWizardDialog() {
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
}
