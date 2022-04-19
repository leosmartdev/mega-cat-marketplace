import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';

@Component({
  selector: 'app-nft-status-card',
  templateUrl: './nft-status-card.component.html',
  styleUrls: ['./nft-status-card.component.scss']
})
export class NftStatusCardComponent implements OnInit {
  @Input() nft: any;
  @Input() walletAddress: any;

  activeNft: string = '';
  constructor() {}

  ngOnInit(): void {}

  openNft(nft) {}
}
