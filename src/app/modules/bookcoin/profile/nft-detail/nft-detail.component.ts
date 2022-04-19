import { Component, Input, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { VenlyService } from 'app/core/venly/venly.service';
import { VenlyNftMetadataByContractAndTokenId } from 'app/core/models/venly/venly-nft-by-contract-and-token.model';
import { ProductService } from 'app/core/product/product.service';

@Component({
  selector: 'app-nft-detail',
  templateUrl: './nft-detail.component.html',
  styleUrls: ['./nft-detail.component.scss']
})
export class NftDetailComponent implements OnInit {
  @Input() nftDetail: any[];
  activePanel: string = 'story';
  activePanel2: string = 'buy-now';
  activePanel3: string = '';
  nft: any;
  defaultStory: any = 'no story available';
  defaultPerks: any = 'no perks available';
  defaultFaqs: any = 'no faqs available';
  defaultTos: any = 'no terms of services available';
  story: any;
  perks: any;
  faqs: any;
  tos: any;
  aboutCol: any = '';
  tokenId: any;
  contractAddress: any;
  attributes: any[];
  colId: any;
  username: any = 'no username available';
  defaultBio: any = 'no bio available';
  bio: any;
  avatar: any = '../../../../assets/images/avatars/brian-hughes.jpg';

  constructor(private router: Router, private venlyService: VenlyService, private activatedRoute: ActivatedRoute, private productService: ProductService) {}

  ngOnInit(): void {
    this.activatedRoute.params.subscribe((params) => {
      this.contractAddress = params.contractAddress;
      this.tokenId = params.tokenId;
    });
    this.nftPage(this.contractAddress, this.tokenId);
  }
  nftPage(contractAddress: string, tokenId: string) {
    this.venlyService.fetchNftMetadata(contractAddress, tokenId).subscribe((response: { message: string; data: VenlyNftMetadataByContractAndTokenId }) => {
      this.nft = response.data;

      this.colId = this.nft.metadata.contract?.media?.find((x) => x.type === 'collectionId')?.value; //media[1]?.value;
      this.aboutCol = this.nft.metadata.contract?.media?.find((x) => x.type === 'about');
      this.story = this.nft.metadata.attributes?.find((x) => x.name === 'story');
      this.perks = this.nft.metadata.attributes?.find((x) => x.name === 'perks');
      this.faqs = this.nft.metadata.attributes?.find((x) => x.name === 'faqs');
      this.tos = this.nft.metadata.attributes?.find((x) => x.name === 'tos');

      this.productService.getUserOfCollection(this.colId).subscribe((res) => {
        this.username = res.data.username;
        this.bio = res.data.bio;
        this.avatar = res.avatar;
      });
      const attributes = [];
      this.nft.metadata.attributes.map((attr) => {
        if (attr.name !== 'story' && attr.name !== 'perks' && attr.name !== 'faqs' && attr.name !== 'tos') {
          attributes.push(attr);
        }
      });
      this.attributes = attributes;
    });
  }

  openPanel(name: string, panel: string) {
    if (panel === 'activePanel') {
      if (this.activePanel === '' || this.activePanel !== name) {
        this.activePanel = name;
      } else {
        this.activePanel = '';
      }
    }
    if (panel === 'activePanel2') {
      if (this.activePanel2 === '' || this.activePanel2 !== name) {
        this.activePanel2 = name;
      } else {
        this.activePanel2 = '';
      }
    }
    if (panel === 'activePanel3') {
      if (this.activePanel3 === '' || this.activePanel3 !== name) {
        this.activePanel3 = name;
      } else {
        this.activePanel3 = '';
      }
    }
  }
}
