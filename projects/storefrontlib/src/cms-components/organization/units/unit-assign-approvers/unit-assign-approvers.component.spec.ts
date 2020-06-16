import {
  Pipe,
  PipeTransform,
  Type,
  Input,
  Output,
  EventEmitter,
  Component,
} from '@angular/core';
import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { RouterTestingModule } from '@angular/router/testing';

import {
  I18nTestingModule,
  RoutingService,
  EntitiesModel,
  B2BSearchConfig,
  RoutesConfig,
  RoutingConfig,
  OrgUnitService,
  B2BUser,
} from '@spartacus/core';
import { BehaviorSubject, of } from 'rxjs';

import { InteractiveTableModule } from '../../../../shared/components/interactive-table/interactive-table.module';
import { UnitAssignApproversComponent } from './unit-assign-approvers.component';
import createSpy = jasmine.createSpy;
import { defaultStorefrontRoutesConfig } from '../../../../cms-structure/routing/default-routing-config';
import { PaginationConfig } from '../../../../shared/components/list-navigation/pagination/config/pagination.config';

const code = 'unitCode';
const roleId = 'b2bapprovergroup';
const customerId = 'customerId1';
const userRow = {
  row: {
    customerId,
  },
};

const defaultParams: B2BSearchConfig = {
  sort: 'byName',
  currentPage: 0,
  pageSize: 5,
};

const mockUserList: EntitiesModel<B2BUser> = {
  values: [
    {
      name: 'b1',
      uid: 'aaa@bbb',
      customerId,
      selected: true,
      orgUnit: { uid: 'orgUid', name: 'orgName' },
      roles: [],
    },
    {
      name: 'b2',
      uid: 'aaa2@bbb',
      customerId: 'customerId2',
      selected: false,
      orgUnit: { uid: 'orgUid2', name: 'orgName2' },
      roles: [],
    },
  ],
  pagination: { totalPages: 1, totalResults: 1, sort: 'byName' },
  sorts: [{ code: 'byName', selected: true }],
};

const mockUserUIList = {
  values: [
    {
      name: 'b1',
      email: 'aaa@bbb',
      selected: true,
      parentUnit: 'orgName',
      uid: 'orgUid',
      customerId,
      roles: [],
    },
    {
      name: 'b2',
      email: 'aaa2@bbb',
      selected: false,
      uid: 'orgUid2',
      customerId: 'customerId2',
      parentUnit: 'orgName2',
      roles: [],
    },
  ],
  pagination: { totalPages: 1, totalResults: 1, sort: 'byName' },
  sorts: [{ code: 'byName', selected: true }],
};
@Component({
  template: '',
  selector: 'cx-pagination',
})
class MockPaginationComponent {
  @Input() pagination;
  @Output() viewPageEvent = new EventEmitter<string>();
}
@Pipe({
  name: 'cxUrl',
})
class MockUrlPipe implements PipeTransform {
  transform() {}
}

const userList = new BehaviorSubject(mockUserList);

class MockOrgUnitService implements Partial<OrgUnitService> {
  loadUsers = createSpy('loadUsers');

  getUsers = createSpy('getUsers').and.returnValue(userList);

  assignApprover = createSpy('assignApprover');

  unassignApprover = createSpy('unassignApprover');
}

class MockRoutingService {
  go = createSpy('go').and.stub();
  getRouterState() {
    return of({
      state: {
        params: {
          code,
          roleId,
        },
        queryParams: {
          sort: 'byName',
          currentPage: '0',
          pageSize: '5',
        },
      },
    });
  }
}
const mockRoutesConfig: RoutesConfig = defaultStorefrontRoutesConfig;
class MockRoutingConfig {
  getRouteConfig(routeName: string) {
    return mockRoutesConfig[routeName];
  }
}

describe('UnitAssignApproversComponent', () => {
  let component: UnitAssignApproversComponent;
  let fixture: ComponentFixture<UnitAssignApproversComponent>;
  let orgUnitService: MockOrgUnitService;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      imports: [RouterTestingModule, InteractiveTableModule, I18nTestingModule],
      declarations: [
        UnitAssignApproversComponent,
        MockUrlPipe,
        MockPaginationComponent,
      ],
      providers: [
        { provide: RoutingConfig, useClass: MockRoutingConfig },
        { provide: RoutingService, useClass: MockRoutingService },
        { provide: OrgUnitService, useClass: MockOrgUnitService },
        {
          provide: PaginationConfig,
          useValue: {
            pagination: {},
          },
        },
      ],
    }).compileComponents();

    orgUnitService = TestBed.get(OrgUnitService as Type<OrgUnitService>);
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(UnitAssignApproversComponent);
    component = fixture.componentInstance;
    userList.next(mockUserList);
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should display No users found page if no users are found', () => {
    const emptyBudgetList: EntitiesModel<B2BUser> = {
      values: [],
      pagination: { totalResults: 0, sort: 'byName' },
      sorts: [{ code: 'byName', selected: true }],
    };

    userList.next(emptyBudgetList);
    fixture.detectChanges();

    expect(fixture.debugElement.query(By.css('.cx-no-items'))).not.toBeNull();
  });

  describe('ngOnInit', () => {
    it('should read user list', () => {
      component.ngOnInit();

      let usersList: any;
      component.data$.subscribe((value) => {
        usersList = value;
      });

      expect(orgUnitService.loadUsers).toHaveBeenCalledWith(
        code,
        roleId,
        defaultParams
      );
      expect(orgUnitService.getUsers).toHaveBeenCalledWith(
        code,
        roleId,
        defaultParams
      );
      expect(usersList).toEqual(mockUserUIList);
    });
  });

  describe('assign', () => {
    it('should assign approver', () => {
      component.assign(userRow);
      expect(orgUnitService.assignApprover).toHaveBeenCalledWith(
        code,
        userRow.row.customerId,
        roleId
      );
    });
  });

  describe('unassign', () => {
    it('should unassign approver', () => {
      component.unassign(userRow);
      expect(orgUnitService.unassignApprover).toHaveBeenCalledWith(
        code,
        userRow.row.customerId,
        roleId
      );
    });
  });
});
