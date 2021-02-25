import { SearchConfig } from 'projects/core/src/product/model/search-config';
import { Observable } from 'rxjs';
import { CartModification } from '../../../model/cart.model';
import { OrderEntry } from 'projects/core/src/model/order.model';
import { BundleStarter } from 'projects/core/src/model/bundle.model';

export abstract class CartBundleAdapter {
  /**
   * Starts a bundle once the productCode, its quantity, and a bundle templateId is provided. A successful result returns a CartModification response.
   *
   * @param userId
   * User identifier or one of the literals : ‘current’ for currently authenticated user, ‘anonymous’ for anonymous user.
   *
   * @param cartId
   * Cart code for logged in user, cart guid for anonymous user, ‘current’ for the last modified cart.
   *
   * @param bundleStarter
   * Mandatory data required to start a bundle. This includes the templateId of the bundle, the productCode, and the quantity of the product itself.
   */
  abstract bundleStart(
    userId: string,
    cartId: string,
    bundleStarter: BundleStarter
  ): Observable<CartModification>;

  /**
   * Returns products and additional data based on the entry group and search query provided.
   *
   * @param userId
   * User identifier or one of the literals : ‘current’ for currently authenticated user, ‘anonymous’ for anonymous user.
   *
   * @param cartId
   * Cart code for logged in user, cart guid for anonymous user, ‘current’ for the last modified cart
   *
   * @param entryGroupNumber
   * Each entry group in a cart has a specific entry group number. Entry group numbers are integers starting at one. They are defined in ascending order.
   *
   * @param searchConfig
   * Options for search.
   */
  abstract bundleAllowedProductsSearch(
    userId: string,
    cartId: string,
    entryGroupNumber: number,
    searchConfig?: SearchConfig
  ): Observable<CartModification>;

  /**
   * Adds a product to a cart entry group.
   *
   * @param userId
   * User identifier or one of the literals : ‘current’ for currently authenticated user, ‘anonymous’ for anonymous user.
   *
   * @param cartId
   * Cart code for logged in user, cart guid for anonymous user, ‘current’ for the last modified cart
   *
   * @param entryGroupNumber
   * Each entry group in a cart has a specific entry group number. Entry group numbers are integers starting at one. They are defined in ascending order.
   *
   * @param entry
   * Request body parameter that contains details such as the product code (product.code) and the quantity of product (quantity).
   */
  abstract bundleAddEntry(
    userId: string,
    cartId: string,
    entryGroupNumber: number,
    entry: OrderEntry
  ): Observable<CartModification>;

  /**
   * Removes an entry group from an associated cart. The entry group is identified by an entryGroupNumber. The cart is identified by the cartId.
   *
   * @param userId
   * User identifier or one of the literals : ‘current’ for currently authenticated user, ‘anonymous’ for anonymous user.
   *
   * @param cartId
   * Cart code for logged in user, cart guid for anonymous user, ‘current’ for the last modified cart
   *
   * @param entryGroupNumber
   * Each entry group in a cart has a specific entry group number. Entry group numbers are integers starting at one. They are defined in ascending order.
   */
  abstract bundleDelete(
    userId: string,
    cartId: string,
    entryGroupNumber: number
  ): Observable<any>;
}