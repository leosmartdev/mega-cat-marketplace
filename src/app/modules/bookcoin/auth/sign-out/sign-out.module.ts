import { NgModule } from '@angular/core';
import { RouterModule } from '@angular/router';
import { MatButtonModule } from '@angular/material/button';
import { FuseCardModule } from '@fuse/components/card';
import { SharedModule } from 'app/shared/shared.module';
import { SignOutComponent } from 'app/modules/bookcoin/auth/sign-out/sign-out.component';
import { signOutRoutes } from 'app/modules/bookcoin/auth/sign-out/sign-out.routing';

@NgModule({
  declarations: [SignOutComponent],
  imports: [RouterModule.forChild(signOutRoutes), MatButtonModule, FuseCardModule, SharedModule]
})
export class SignOutModule {}
