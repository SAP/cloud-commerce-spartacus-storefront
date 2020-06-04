import { Type } from '@angular/core';
import { async, TestBed } from '@angular/core/testing';
import { Cart, OCC_USER_ID_ANONYMOUS } from '@spartacus/core';
import { GenericConfigurator } from '../../../model/generic-configurator.model';
import { GenericConfigUtilsService } from './config-utils.service';

const productCode = 'CONF_LAPTOP';
const documentId = '12344';
const entryNumber = 4;
let owner: GenericConfigurator.Owner = null;

const CART_CODE = '0000009336';
const CART_GUID = 'e767605d-7336-48fd-b156-ad50d004ca10';

const cart: Cart = {
  code: CART_CODE,
  guid: CART_GUID,
  user: { uid: OCC_USER_ID_ANONYMOUS },
};

describe('GenericConfigUtilsService', () => {
  let classUnderTest: GenericConfigUtilsService;

  beforeEach(async(() => {
    TestBed.configureTestingModule({}).compileComponents();
  }));
  beforeEach(() => {
    classUnderTest = TestBed.inject(
      GenericConfigUtilsService as Type<GenericConfigUtilsService>
    );
    owner = {};
  });

  it('should create component', () => {
    expect(classUnderTest).toBeDefined();
  });

  it('should set key for product related owner', () => {
    owner.type = GenericConfigurator.OwnerType.PRODUCT;
    owner.id = productCode;
    classUnderTest.setOwnerKey(owner);
    expect(owner.key.includes(productCode)).toBe(true);
    expect(owner.key.includes(GenericConfigurator.OwnerType.PRODUCT)).toBe(
      true
    );
  });

  it('should set key for document related owner', () => {
    owner.type = GenericConfigurator.OwnerType.CART_ENTRY;
    owner.id = '1';
    classUnderTest.setOwnerKey(owner);
    expect(owner.key.includes(owner.id)).toBe(true);
    expect(owner.key.includes(GenericConfigurator.OwnerType.CART_ENTRY)).toBe(
      true
    );
  });

  it('should throw an error if no owner type is present', () => {
    expect(function () {
      classUnderTest.setOwnerKey(owner);
    }).toThrow();
  });

  it('should throw an error if for owner type PRODUCT if no product code is present', () => {
    owner.type = GenericConfigurator.OwnerType.PRODUCT;
    expect(function () {
      classUnderTest.setOwnerKey(owner);
    }).toThrow();
  });

  it('should throw an error if for owner type CART_ENTRY no cart entry link is present', () => {
    owner.type = GenericConfigurator.OwnerType.CART_ENTRY;
    expect(function () {
      classUnderTest.setOwnerKey(owner);
    }).toThrow();
  });

  it('should throw an error if for owner type ORDER_ENTRY no order entry link is present', () => {
    owner.type = GenericConfigurator.OwnerType.ORDER_ENTRY;
    expect(function () {
      classUnderTest.setOwnerKey(owner);
    }).toThrow();
  });

  it('should compose an owner ID from 2 attributes', () => {
    expect(classUnderTest.getComposedOwnerId(documentId, entryNumber)).toBe(
      documentId + '+' + entryNumber
    );
  });

  it('should decompose an owner ID properly', () => {
    const decompose = classUnderTest.decomposeOwnerId(
      classUnderTest.getComposedOwnerId(documentId, entryNumber)
    );
    expect(decompose.documentId).toBe(documentId);
    expect(decompose.entryNumber).toBe('' + entryNumber);
  });

  it('should throw an error in case ownerId is malformed', () => {
    expect(function () {
      classUnderTest.decomposeOwnerId(documentId);
    }).toThrow();
  });

  describe('getCartId', () => {
    it('should return cart guid if user is anonymous', () => {
      expect(classUnderTest.getCartId(cart)).toBe(CART_GUID);
    });

    it('should return cart code if user is not anonymous', () => {
      const namedCart: Cart = {
        code: CART_CODE,
        guid: CART_GUID,
        user: { name: 'Ulf Becker', uid: 'ulf.becker@rustic-hw.com' },
      };
      expect(classUnderTest.getCartId(namedCart)).toBe(CART_CODE);
    });
  });

  describe('getUserId', () => {
    it('should return anonymous user id if user is anonymous', () => {
      expect(classUnderTest.getUserId(cart)).toBe(OCC_USER_ID_ANONYMOUS);
    });
  });
});
