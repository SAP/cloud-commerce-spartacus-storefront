import { CommonConfigurator } from '@spartacus/product-configurator/common';
import { ConfiguratorTextfield } from '../../model/configurator-textfield.model';
import { ConfiguratorTextfieldActions } from '../actions/index';
import { reducer } from './configurator-textfield.reducer';

describe('ConfiguratorTextfieldReducer', () => {
  const attributeName = 'attributeName';

  const productConfigurationInitial: ConfiguratorTextfield.Configuration = {
    configurationInfos: [],
    owner: CommonConfigurator.createOwner(),
  };
  const productConfiguration: ConfiguratorTextfield.Configuration = {
    configurationInfos: [{ configurationLabel: attributeName }],
    owner: CommonConfigurator.createOwner(),
  };
  const productCode = 'CONF_LAPTOP';

  it('should not change state in case action is not covered in reducer', () => {
    const result = reducer(
      productConfigurationInitial,
      new ConfiguratorTextfieldActions.CreateConfiguration({
        productCode: productCode,
        owner: CommonConfigurator.createOwner(),
      })
    );
    expect(result).toBeDefined();
    expect(result).toBe(productConfigurationInitial);
  });

  it('should change state on CreateConfigurationSuccess ', () => {
    const result = reducer(
      productConfigurationInitial,
      new ConfiguratorTextfieldActions.CreateConfigurationSuccess(
        productConfiguration
      )
    );
    expect(result).toBeDefined();
    expect(result).toEqual(productConfiguration);
  });

  it('should change state on readFromCartEntry ', () => {
    const result = reducer(
      productConfigurationInitial,
      new ConfiguratorTextfieldActions.ReadCartEntryConfigurationSuccess(
        productConfiguration
      )
    );
    expect(result).toBeDefined();
    expect(result).toEqual(productConfiguration);
  });

  it('should change state on UpdateConfiguration ', () => {
    const result = reducer(
      productConfigurationInitial,
      new ConfiguratorTextfieldActions.UpdateConfiguration(productConfiguration)
    );
    expect(result).toBeDefined();
    expect(result).toEqual(productConfiguration);
  });

  it('should remove state on RemoveConfiguration ', () => {
    const result = reducer(
      productConfiguration,
      new ConfiguratorTextfieldActions.RemoveConfiguration()
    );
    expect(result).toBeDefined();
    expect(result).toEqual(productConfigurationInitial);
  });
});
