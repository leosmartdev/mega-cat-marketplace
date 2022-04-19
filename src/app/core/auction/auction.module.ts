import { NgModule } from '@angular/core';
import { HttpClientModule } from '@angular/common/http';
import { AuctionService } from './auction.service';
import { AuthService } from '../auth/auth.service';

@NgModule({
  imports: [HttpClientModule, AuthService],
  providers: [AuctionService]
})
export class AuctionModule {}
