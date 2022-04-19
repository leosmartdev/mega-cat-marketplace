import { TruncatePipe } from './truncate.pipe';
import { NgModule } from '@angular/core';

@NgModule({
  imports: [],
  declarations: [TruncatePipe],
  exports: [TruncatePipe]
})
export class CustomPipesModule {
  static forRoot() {
    return {
      ngModule: CustomPipesModule,
      providers: []
    };
  }
}
