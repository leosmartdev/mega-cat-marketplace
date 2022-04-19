/* eslint-disable max-len */
import { NgModule } from '@angular/core';
import { bkcnRoutes } from './bkcn-routes';
import { mclRoutes } from './mcl-routes';
import { environment } from 'environments/environment';
import { RouterModule } from '@angular/router';
@NgModule({
  imports: [RouterModule.forRoot(environment.app === 'BKCN' ? bkcnRoutes : mclRoutes, { scrollPositionRestoration: 'enabled' })],
  exports: [RouterModule]
})
export class AppRoutingModule {}
