import { NgModule } from '@angular/core';
import { HttpClientModule } from '@angular/common/http';
import { VenlyService } from 'app/core/venly/venly.service';

@NgModule({
  imports: [HttpClientModule],
  providers: [VenlyService]
})
export class VenlyModule {}
