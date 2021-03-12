import { Injectable, Type } from '@angular/core';
import { ofType } from '@ngrx/effects';
import { ActionsSubject } from '@ngrx/store';
import {
  ActionToEventMapping,
  CartActions,
  createFrom,
  EventService,
  MultiCartService,
  StateEventService,
} from '@spartacus/core';
import {
  DeleteCart,
  DeleteCartFail,
  DeleteCartSuccess,
} from 'projects/core/src/cart/store/actions/cart.action';
import { Observable, of } from 'rxjs';
import { filter, map, switchMap, withLatestFrom } from 'rxjs/operators';
import {
  SaveCart,
  SaveCartFail,
} from '../../core/store/actions/saved-cart.action';
import { SavedCartActions } from '../../core/store/index';
import {
  DeleteSavedCartEvent,
  DeleteSavedCartFailEvent,
  DeleteSavedCartSuccessEvent,
  RestoreSavedCartEvent,
  RestoreSavedCartFailEvent,
  RestoreSavedCartSuccessEvent,
  SaveCartEvent,
  SaveCartFailEvent,
  SaveCartSuccessEvent,
} from './saved-cart.events';

@Injectable({ providedIn: 'root' })
export class SavedCartEventBuilder {
  constructor(
    protected actionsSubject: ActionsSubject,
    protected eventService: EventService,
    protected stateEventService: StateEventService,
    protected multiCartService: MultiCartService
  ) {
    this.register();
  }

  /**
   * Registers events for the saved cart
   */
  protected register(): void {
    this.registerRestoreEvents();
    this.registerDeleteEvents();
    this.registerSaveEvents();
  }

  protected registerRestoreEvents(): void {
    this.buildRestoreSavedCartEvents(
      {
        action: SavedCartActions.RESTORE_SAVED_CART,
        event: RestoreSavedCartEvent,
      },
      true
    );

    this.buildRestoreSavedCartEvents({
      action: SavedCartActions.RESTORE_SAVED_CART_SUCCESS,
      event: RestoreSavedCartSuccessEvent,
    });

    this.buildRestoreSavedCartEvents(
      {
        action: SavedCartActions.RESTORE_SAVED_CART_FAIL,
        event: RestoreSavedCartFailEvent,
      },
      true
    );
  }

  protected registerDeleteEvents(): void {
    this.stateEventService.register({
      action: CartActions.DELETE_CART,
      event: DeleteSavedCartEvent,
      factory: (action: DeleteCart) =>
        createFrom(DeleteSavedCartEvent, {
          ...action.payload,
          cartCode: action.payload.cartId,
        }),
    });

    this.stateEventService.register({
      action: CartActions.DELETE_CART_SUCCESS,
      event: DeleteSavedCartSuccessEvent,
      factory: (action: DeleteCartSuccess) =>
        createFrom(DeleteSavedCartSuccessEvent, {
          ...action.payload,
          cartCode: action.payload.cartId,
        }),
    });

    this.stateEventService.register({
      action: CartActions.DELETE_CART_FAIL,
      event: DeleteSavedCartFailEvent,
      factory: (action: DeleteCartFail) =>
        createFrom(DeleteSavedCartFailEvent, {
          ...action.payload,
          cartCode: action.payload.cartId,
        }),
    });
  }

  protected registerSaveEvents(): void {
    this.buildSaveCartSuccessEvent({
      action: SavedCartActions.SAVE_CART_SUCCESS,
      event: SaveCartSuccessEvent,
    });

    this.stateEventService.register({
      action: SavedCartActions.SAVE_CART_FAIL,
      event: SaveCartFailEvent,
      factory: (action: SaveCartFail) =>
        createFrom(SaveCartFailEvent, {
          ...action.payload,
          cartCode: action.payload.cartId,
        }),
    });

    this.stateEventService.register({
      action: SavedCartActions.SAVE_CART,
      event: SaveCartEvent,
      factory: (action: SaveCart) => {
        return createFrom(SaveCartEvent, {
          ...action.payload,
          cartCode: action.payload.cartId,
        });
      },
    });
  }

  /**
   * Builds the restore save cart events from the action and cart
   *
   * @param mapping mapping declaration from `action` string type to `event` class type
   * @param saveTime should the saveTime attribute be added to the event
   * @returns
   */
  protected buildRestoreSavedCartEvents<T>(
    mapping: ActionToEventMapping<T>,
    saveTime?: boolean
  ): () => void {
    const eventStream$ = this.getAction(mapping.action).pipe(
      switchMap((action) => {
        return of(action).pipe(
          withLatestFrom(this.multiCartService.getCart(action.payload.cartId))
        );
      }),
      map(([action, cart]) =>
        createFrom(mapping.event as Type<T>, {
          ...action.payload,
          cartCode: cart?.code,
          saveCartName: cart?.name,
          saveCartDescription: cart?.description,
          ...(saveTime && { saveTime: cart?.saveTime }),
        })
      )
    );
    return this.eventService.register(mapping.event as Type<T>, eventStream$);
  }

  /**
   * Builds save cart event by adding the saveTime from the cart
   *
   * @param mapping mapping declaration from `action` string type to `event` class type
   * @returns events register function
   */
  protected buildSaveCartSuccessEvent<T>(
    mapping: ActionToEventMapping<T>
  ): () => void {
    const eventStream$ = this.getAction(mapping.action).pipe(
      switchMap((action) => {
        return of(action).pipe(
          withLatestFrom(this.multiCartService.getCart(action.payload.cartId))
        );
      }),
      filter(([, cart]) => Boolean(cart)),
      map(([action, cart]) =>
        createFrom(mapping.event as Type<T>, {
          ...action.payload,
          cartCode: cart.code,
          saveTime: cart.saveTime,
        })
      )
    );
    return this.eventService.register(mapping.event as Type<T>, eventStream$);
  }

  /**
   * Returns a stream of actions only of a given type(s)
   *
   * @param actionType type(s) of actions
   */
  protected getAction(
    actionType: string | string[]
  ): Observable<{ type: string; payload?: any }> {
    return this.actionsSubject.pipe(ofType(...[].concat(actionType)));
  }
}
