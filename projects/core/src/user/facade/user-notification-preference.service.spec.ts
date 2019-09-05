import { inject, TestBed } from '@angular/core/testing';
import { StateWithUser, USER_FEATURE } from '../store/user-state';
import { UserNotificationPreferenceService } from './user-notification-preference.service';
import { StoreModule, Store } from '@ngrx/store';
import * as fromStoreReducers from '../store/reducers/index';
import { PROCESS_FEATURE } from '../../process/store/process-state';
import * as fromProcessReducers from '../../process/store/reducers';
import { Type } from '@angular/core';
import { UserActions } from '../store/actions/index';
import { NotificationPreference } from '../../model/notification-preference.model';
import { USERID_CURRENT } from '../../occ/utils/occ-constants';

fdescribe('UserNotificationPreferenceService', () => {
  let userNotificationPreferenceService: UserNotificationPreferenceService;
  let store: Store<StateWithUser>;
  const mockNotificationPreference: NotificationPreference[] = [
    {
      channel: 'EMAIL',
      value: 'test@sap.com',
      enabled: false,
      visible: true,
    },
  ];
  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [
        StoreModule.forRoot({}),
        StoreModule.forFeature(USER_FEATURE, fromStoreReducers.getReducers()),
        StoreModule.forFeature(
          PROCESS_FEATURE,
          fromProcessReducers.getReducers()
        ),
      ],
      providers: [UserNotificationPreferenceService],
    });

    store = TestBed.get(Store as Type<Store<StateWithUser>>);
    spyOn(store, 'dispatch').and.callThrough();
    userNotificationPreferenceService = TestBed.get(
      UserNotificationPreferenceService as Type<
        UserNotificationPreferenceService
      >
    );
  });

  it('should UserNotificationPreferenceService is injected', inject(
    [UserNotificationPreferenceService],
    (userNotificationPreferenceService: UserNotificationPreferenceService) => {
      expect(userNotificationPreferenceService).toBeTruthy();
    }
  ));

  it('should be able to get notification preferences', () => {
    store.dispatch(
      new UserActions.LoadNotificationPreferencesSuccess(
        mockNotificationPreference
      )
    );
    let notificationPreferences: NotificationPreference[];
    userNotificationPreferenceService
      .getPreferences()
      .subscribe(preferences => {
        notificationPreferences = preferences;
      })
      .unsubscribe();
    expect(notificationPreferences).toEqual(mockNotificationPreference);
  });

  it('should be able to load notification preferences', () => {
    userNotificationPreferenceService.loadPreferences();
    expect(store.dispatch).toHaveBeenCalledWith(
      new UserActions.LoadNotificationPreferences(USERID_CURRENT)
    );
  });

  it('should be able to get notification preferences loading flag', () => {
    store.dispatch(
      new UserActions.LoadNotificationPreferencesSuccess(
        mockNotificationPreference
      )
    );

    let notificationPreferenceLoading: boolean;
    userNotificationPreferenceService
      .getPreferencesLoading()
      .subscribe(loading => {
        notificationPreferenceLoading = loading;
      })
      .unsubscribe();
    expect(notificationPreferenceLoading).toEqual(false);
  });

  it('should be able to update notification preferences', () => {
    userNotificationPreferenceService.updatePreferences(
      mockNotificationPreference
    );
    expect(store.dispatch).toHaveBeenCalledWith(
      new UserActions.UpdateNotificationPreferences({
        userId: USERID_CURRENT,
        preferences: mockNotificationPreference,
      })
    );
  });

  it('sshould be able to get update notification preferences loading flag', () => {
    store.dispatch(
      new UserActions.UpdateNotificationPreferences({
        userId: USERID_CURRENT,
        preferences: mockNotificationPreference,
      })
    );

    let result = false;
    userNotificationPreferenceService
      .getUpdatePreferencesResultLoading()
      .subscribe(loading => (result = loading))
      .unsubscribe();

    expect(result).toEqual(true);
  });
});
