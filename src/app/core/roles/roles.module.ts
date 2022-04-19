import { NgModule } from '@angular/core';
import { HttpClientModule } from '@angular/common/http';
import { RolesService } from 'app/core/roles/roles.service';

@NgModule({
  imports: [HttpClientModule],
  providers: [RolesService]
})
export class RolesModule {}
