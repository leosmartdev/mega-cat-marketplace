import { NgModule } from '@angular/core';
import { BookCoinLandingLayoutComponent } from 'app/modules/bookcoin/layout/landing-layout/bookcoin-landing-layout.component';
import { HeaderComponent } from 'app/modules/bookcoin/layout/header/header.component';
import { FooterComponent } from 'app/modules/bookcoin/layout/footer/footer.component';
import { RouterModule } from '@angular/router';
import { BrowserModule } from '@angular/platform-browser';
import { MatTabsModule } from '@angular/material/tabs';
import { MatBadgeModule } from '@angular/material/badge';

@NgModule({
  declarations: [BookCoinLandingLayoutComponent, HeaderComponent, FooterComponent],
  imports: [RouterModule, BrowserModule, MatTabsModule, MatBadgeModule],
  exports: [BookCoinLandingLayoutComponent]
})
export class BookCoinLandingLayoutModule {}
