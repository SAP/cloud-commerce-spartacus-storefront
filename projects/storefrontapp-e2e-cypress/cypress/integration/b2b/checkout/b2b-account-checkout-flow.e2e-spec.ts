import * as b2bCheckout from '../../../helpers/b2b/b2b-checkout';
import {
  b2bAccountShipToUser,
  b2bProduct,
  cartWithB2bProduct,
  order_type,
  POWERTOOLS_BASESITE,
} from '../../../sample-data/b2b-checkout';

context('B2B - Account Checkout flow', () => {
  before(() => {
    cy.window().then((win) => win.sessionStorage.clear());
    Cypress.env('BASE_SITE', POWERTOOLS_BASESITE);
  });

  beforeEach(() => {
    cy.restoreLocalStorage();
  });

  afterEach(() => {
    cy.saveLocalStorage();
  });

  it('should login to b2b user', () => {
    b2bCheckout.loginB2bUser();
  });

  it('should add a product to cart and verify quantity and total amount', () => {
    b2bCheckout.addB2bProductToCart(cartWithB2bProduct);
  });

  it('should update product quantity and total amount in add-to-cart-dialog', () => {
    b2bCheckout.updateB2bProductInDialog(cartWithB2bProduct);
  });

  it('should verify and update product quantity and total amount in cart', () => {
    b2bCheckout.updateB2bProductInCartAndCheckout(cartWithB2bProduct);
  });

  it('should select Account payment type', () => {
    b2bCheckout.enterPONumber();
    b2bCheckout.selectAccountPayment();
  });

  it('should enter shipping address', () => {
    b2bCheckout.selectAccountShippingAddress();
  });

  it('should select delivery mode', () => {
    b2bCheckout.selectAccountDeliveryMode();
  });

  it('should review and place order', () => {
    b2bCheckout.reviewB2bReviewOrderPage(
      b2bAccountShipToUser,
      cartWithB2bProduct,
      true,
      order_type.PLACE_ORDER
    );

    b2bCheckout.placeOrder('/order-confirmation');
  });

  it('should display summary page', () => {
    b2bCheckout.reviewB2bOrderConfirmation(
      b2bAccountShipToUser,
      b2bProduct,
      cartWithB2bProduct
    );
  });
});