import { AuthService } from 'app/core/auth/auth.service';
import { WalletService } from 'app/core/wallet/wallet.service';
import { Component, OnInit } from '@angular/core';
import { NftDrop } from 'app/core/models/nft-drop.model';
import { List } from 'lodash';
import { DropService } from '../drop.service';
import { environment } from 'environments/environment';
const dynamicStyleUrl = environment.app === 'BKCN' ? './landing.component.bkcn.scss' : './landing.component.mcl.scss';

@Component({
  selector: 'app-landing',
  templateUrl: './landing.component.html',
  styleUrls: [dynamicStyleUrl]
})
export class LandingDropComponent implements OnInit {
  drops: List<NftDrop>;
  constructor(private dropService: DropService, private authService: AuthService) {}

  ngOnInit(): void {
    this.dropService.fetchDrops().subscribe((response: { message: string; data: List<NftDrop> }) => {
      const drops = response.data;
      this.drops = drops;
    });
  }

  canCreateDrop() {
    return this.authService.isAdmin();
  }
}
