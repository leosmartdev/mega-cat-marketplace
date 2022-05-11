import { state } from '@angular/animations';
import { Component, OnInit } from '@angular/core';
import { BsModalRef, ModalOptions } from 'ngx-bootstrap/modal';

@Component({
  selector: 'app-mint-pop-up',
  templateUrl: './mint-pop-up.component.html',
  styleUrls: ['./mint-pop-up.component.scss']
})
export class MintPopUpComponent implements OnInit {
  state:
    | {
        tokenIds: string[];
        contractAddress: string;
        transactions: string[];
        chain: string;
      }
    | any = {
    tokenIds: [],
    contractAddress: '',
    transactions: [],
    chain: ''
  };

  openSeaLinks: string[];
  txLinkBase: string;

  constructor(public bsModalRef: BsModalRef, public options: ModalOptions) {
    this.state = options.initialState;

    this.openSeaLinks = this.buildLinks(this.state.tokenIds);
  }

  ngOnInit(): void {}

  hideModal() {
    this.bsModalRef.hide();
  }

  buildLinks(tokenIds: string[]): string[] {
    if (!Boolean(tokenIds) || tokenIds.length === 0) {
      return;
    }

    const testnet = this.state.chain === 'ethereum' ? '' : 'testnets.';
    const openSeaLinks = tokenIds.map((tokenId) => `https://${testnet}opensea.io/assets/${this.state.contractAddress}/${tokenId}`);

    const testnetRinkeby = this.state.chain === 'ethereum' ? '' : 'rinkeby.';
    const txLinkBase = `https://${testnetRinkeby}etherscan.io/tx/`;
    this.txLinkBase = txLinkBase;

    return openSeaLinks;
  }
}
