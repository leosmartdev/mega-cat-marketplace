import { NgModule } from '@angular/core';
import { HttpClientModule } from '@angular/common/http';
import { HomepageService } from 'app/core/homepage/homepage.service';

@NgModule({
  imports: [HttpClientModule],
  providers: [HomepageService]
})
export class HomepageModule {}
