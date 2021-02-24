import { NgModule } from '@angular/core';
import { provideDefaultConfigFactory } from '@spartacus/core';
import { PageLayoutModule } from '@spartacus/storefront';
import { USER_ACCOUNT_FEATURE } from './feature-name';

// TODO: Inline this factory when we start releasing Ivy compiled libraries
export function defaultUserAccountComponentsConfig() {
  const config = {
    featureModules: {
      [USER_ACCOUNT_FEATURE]: {
        cmsComponents: [
          'LoginComponent',
          'ReturningCustomerLoginComponent',
          'ReturningCustomerRegisterComponent',
        ],
      },
    },
  };
  return config;
}

@NgModule({
  imports: [PageLayoutModule],
  providers: [provideDefaultConfigFactory(defaultUserAccountComponentsConfig)],
})
export class UserAccountRootModule {}