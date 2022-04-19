import { NgModule } from '@angular/core';
import { LandingLayoutComponent } from 'app/modules/layout/landing-layout/landing-layout.component';
import { HeaderComponent } from 'app/modules/layout/header/header.component';
import { FooterComponent } from 'app/modules/layout/footer/footer.component';
import { RouterModule } from '@angular/router';
import { BrowserModule } from '@angular/platform-browser';
import { MatTabsModule } from '@angular/material/tabs';
import { MatBadgeModule } from '@angular/material/badge';

@NgModule({
  declarations: [LandingLayoutComponent, HeaderComponent, FooterComponent],
  imports: [RouterModule, BrowserModule, MatTabsModule, MatBadgeModule],
  exports: [LandingLayoutComponent]
})
export class LandingLayoutModule {}
