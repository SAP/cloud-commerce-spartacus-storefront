import { Injectable } from '@angular/core';
import { Actions, Effect, ofType } from '@ngrx/effects';
import {
  GlobalMessageActions,
  GlobalMessageType,
  normalizeHttpError,
} from '@spartacus/core';
import { from, Observable } from 'rxjs';
import { catchError, map, switchMap } from 'rxjs/operators';
import { UserProfileConnector } from '../../connectors/user-profile.connector';
import { UserActions } from '../actions/index';

@Injectable()
export class ResetPasswordEffects {
  @Effect()
  resetPassword$: Observable<
    | UserActions.ResetPasswordSuccess
    | GlobalMessageActions.AddMessage
    | UserActions.ResetPasswordFail
  > = this.actions$.pipe(
    ofType(UserActions.RESET_PASSWORD),
    map((action: UserActions.ResetPassword) => action.payload),
    switchMap(({ token, password }) => {
      return this.userAccountConnector.resetPassword(token, password).pipe(
        switchMap(() => [
          new UserActions.ResetPasswordSuccess(),
          new GlobalMessageActions.AddMessage({
            text: { key: 'forgottenPassword.passwordResetSuccess' },
            type: GlobalMessageType.MSG_TYPE_CONFIRMATION,
          }),
        ]),
        catchError((error) => {
          const actions: Array<
            UserActions.ResetPasswordFail | GlobalMessageActions.AddMessage
          > = [new UserActions.ResetPasswordFail(normalizeHttpError(error))];
          if (error?.error?.errors) {
            error.error.errors.forEach((err) => {
              if (err.message) {
                actions.push(
                  new GlobalMessageActions.AddMessage({
                    text: { raw: err.message },
                    type: GlobalMessageType.MSG_TYPE_ERROR,
                  })
                );
              }
            });
          }
          return from(actions);
        })
      );
    })
  );

  constructor(
    private actions$: Actions,
    private userAccountConnector: UserProfileConnector
  ) {}
}
