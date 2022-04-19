import { CustomPipesModule } from './../../../shared/pipes/custom-pipes.module';
import { NgModule } from '@angular/core';
import { RouterModule } from '@angular/router';
import { HomeComponent } from 'app/modules/bookcoin/home/home.component';
import { homeRoutes } from 'app/modules/bookcoin/home/home.routing';
import { IvyCarouselModule } from 'angular-responsive-carousel';
import { CommonModule } from '@angular/common';
import { MatTabsModule } from '@angular/material/tabs';
import { MatSelectModule } from '@angular/material/select';
import { HomepageModule } from 'app/core/homepage/homepage.module';
import { NftCardBkcnModule } from 'app/modules/elements/nft-card-bkcn/nft-card-bkcn.module';

@NgModule({
  declarations: [HomeComponent],
  imports: [RouterModule.forChild(homeRoutes), IvyCarouselModule, CommonModule, MatTabsModule, MatSelectModule, HomepageModule, NftCardBkcnModule, CustomPipesModule.forRoot()]
})
export class HomeModule {}
