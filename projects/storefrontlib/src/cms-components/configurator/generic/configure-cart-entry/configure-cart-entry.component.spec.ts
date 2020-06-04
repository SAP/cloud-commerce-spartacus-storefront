import { Pipe, PipeTransform } from '@angular/core';
import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { RouterTestingModule } from '@angular/router/testing';
import { GenericConfigurator, I18nTestingModule } from '@spartacus/core';
import { ConfigureCartEntryComponent } from './configure-cart-entry.component';

@Pipe({
  name: 'cxUrl',
})
class MockUrlPipe implements PipeTransform {
  transform(): any {}
}

describe('ConfigureCartEntryComponent', () => {
  let component: ConfigureCartEntryComponent;
  let fixture: ComponentFixture<ConfigureCartEntryComponent>;
  const configuratorType = 'type';

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      imports: [I18nTestingModule, RouterTestingModule],
      declarations: [ConfigureCartEntryComponent, MockUrlPipe],
      providers: [],
    }).compileComponents();
  }));
  beforeEach(() => {
    fixture = TestBed.createComponent(ConfigureCartEntryComponent);
    component = fixture.componentInstance;
  });

  it('should create component', () => {
    expect(component).toBeDefined();
  });

  it('should find correct default owner type', () => {
    expect(component.getOwnerType()).toBe(
      GenericConfigurator.OwnerType.CART_ENTRY
    );
  });

  it('should find correct owner type in case view is read-only', () => {
    component.readOnly = true;
    expect(component.getOwnerType()).toBe(
      GenericConfigurator.OwnerType.ORDER_ENTRY
    );
  });

  it('should find correct entity key for cart entry', () => {
    component.cartEntry = { entryNumber: 0 };
    expect(component.getEntityKey()).toBe('0');
  });

  it('should compile correct route for cart entry', () => {
    component.cartEntry = {
      entryNumber: 0,
      product: { configuratorType: configuratorType },
    };
    expect(component.getRoute()).toBe('configure' + configuratorType);
  });

  it('should compile correct route for order entry', () => {
    component.readOnly = true;
    component.cartEntry = {
      entryNumber: 0,
      product: { configuratorType: configuratorType },
    };
    expect(component.getRoute()).toBe('configureOverview' + configuratorType);
  });
});
