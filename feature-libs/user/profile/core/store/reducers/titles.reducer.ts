import { Title } from '../../model/user-profile.model';
import { UserActions } from '../actions/index';
import { TitlesState } from '../user-profile.state';

export const initialState: TitlesState = {
  entities: {},
};

export function reducer(
  state = initialState,
  action: UserActions.TitlesAction | UserActions.ClearUserMiscData
): TitlesState {
  switch (action.type) {
    case UserActions.LOAD_TITLES_SUCCESS: {
      const titles = action.payload;
      const entities = titles.reduce(
        (titleEntities: { [code: string]: Title }, name: Title) => {
          return {
            ...titleEntities,
            [name.code]: name,
          };
        },
        {
          ...state.entities,
        }
      );

      return {
        ...state,
        entities,
      };
    }

    case UserActions.CLEAR_USER_MISC_DATA: {
      return initialState;
    }
  }

  return state;
}
