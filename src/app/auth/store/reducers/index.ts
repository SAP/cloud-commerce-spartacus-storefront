import {
  ActionReducerMap,
  MemoizedSelector,
  createFeatureSelector
} from '@ngrx/store';

import * as fromUserDetailsReducer from './user-details.reducer';
import * as fromUserToken from './user-token.reducer';

export interface UserState {
  account: fromUserDetailsReducer.UserDetailsState;
  auth: fromUserToken.UserTokenState;
}

export const reducers: ActionReducerMap<UserState> = {
  account: fromUserDetailsReducer.reducer,
  auth: fromUserToken.reducer
};

export const getUserState: MemoizedSelector<
  any,
  UserState
> = createFeatureSelector<UserState>('user');
