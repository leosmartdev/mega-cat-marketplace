import { NgModule, Optional, SkipSelf } from '@angular/core';
import { AuthModule } from 'app/core/auth/auth.module';
import { ProductModule } from 'app/core/product/product.module';
import { CartModule } from 'app/core/cart/cart.module';
import { VenlyModule } from 'app/core/venly/venly.module';
import { IconsModule } from 'app/core/icons/icons.module';
import { TranslocoCoreModule } from 'app/core/transloco/transloco.module';
import { ErrorsModule } from './errors/errors.module';
import { OverlayModule } from '@angular/cdk/overlay';
import { AchievementModule } from 'app/core/achievement/achievement.module';

@NgModule({
  imports: [AuthModule, ProductModule, CartModule, VenlyModule, ErrorsModule, IconsModule, TranslocoCoreModule, OverlayModule, AchievementModule]
})
export class CoreModule {
  /**
   * Constructor
   */
  constructor(@Optional() @SkipSelf() parentModule?: CoreModule) {
    // Do not allow multiple injections
    if (parentModule) {
      throw new Error('CoreModule has already been loaded. Import this module in the AppModule only.');
    }
  }
}
