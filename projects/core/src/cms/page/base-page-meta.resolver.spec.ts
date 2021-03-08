import { TestBed } from '@angular/core/testing';
import { Router, RouterEvent } from '@angular/router';
import { Observable, of, ReplaySubject } from 'rxjs';
import { BasePageMetaResolver, CmsService, Page } from '..';
import { I18nTestingModule, TranslationService } from '../../i18n';
import { PageType } from '../../model/cms.model';
import { PageMetaService } from '../facade';
import { BreadcrumbMeta, PageRobotsMeta } from '../model/page.model';
import { PageLinkService } from './routing/page-link.service';
import { RoutingPageMetaResolver } from './routing/routing-page-meta.resolver';

const mockContentPage: Page = {
  type: PageType.CONTENT_PAGE,
  title: 'Page title',
  slots: {},
  robots: [PageRobotsMeta.FOLLOW, PageRobotsMeta.INDEX],
};

class MockCmsService implements Partial<CmsService> {
  getCurrentPage(): Observable<Page> {
    return of(mockContentPage);
  }
}

class MockTranslationService implements Partial<TranslationService> {
  translate(key: string) {
    return of(key);
  }
}

class MockRoutingPageMetaResolver implements Partial<RoutingPageMetaResolver> {
  resolveBreadcrumbs() {
    return of([]);
  }
}

class MockPageLinkFactory {
  getCanonicalUrl() {}
}

describe('BasePageMetaResolver', () => {
  let service: BasePageMetaResolver;
  let routingPageMetaResolver: RoutingPageMetaResolver;
  let routerEventRelaySubject: ReplaySubject<RouterEvent>;
  let routerMock: Router;
  routerEventRelaySubject = new ReplaySubject<RouterEvent>(1);
  routerMock = {
    events: routerEventRelaySubject.asObservable(),
  } as Router;
  let pageLinkService: PageLinkService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [I18nTestingModule],
      providers: [
        PageMetaService,
        { provide: CmsService, useClass: MockCmsService },
        {
          provide: TranslationService,
          useClass: MockTranslationService,
        },
        {
          provide: RoutingPageMetaResolver,
          useClass: MockRoutingPageMetaResolver,
        },
        {
          provide: Router,
          useValue: routerMock,
        },
        {
          provide: PageLinkService,
          useClass: MockPageLinkFactory,
        },
      ],
    });

    service = TestBed.inject(BasePageMetaResolver);
    routingPageMetaResolver = TestBed.inject(RoutingPageMetaResolver);
    pageLinkService = TestBed.inject(PageLinkService);
  });

  it('should inject service', () => {
    expect(service).toBeTruthy();
  });

  it(`should resolve 'Page title' for resolveTitle()`, () => {
    let result: string | undefined;

    service
      .resolveTitle()
      .subscribe((meta) => {
        result = meta;
      })
      .unsubscribe();

    expect(result).toEqual('Page title');
  });

  it('should resolve the home breadcrumb for resolveBreadcrumbs()', () => {
    let result: BreadcrumbMeta[] | undefined;
    service
      .resolveBreadcrumbs()
      .subscribe((meta) => {
        result = meta;
      })
      .unsubscribe();
    expect(result?.length).toEqual(1);
    expect(result?.[0]?.label).toEqual('common.home');
    expect(result?.[0]?.link).toEqual('/');
  });

  it('should breadcrumbs for Angular child routes', () => {
    let result: BreadcrumbMeta[] | undefined;

    spyOn(routingPageMetaResolver, 'resolveBreadcrumbs').and.returnValue(
      of([{ label: 'child route breadcrumb', link: '/child' }])
    );
    service
      .resolveBreadcrumbs()
      .subscribe((meta) => {
        result = meta;
      })
      .unsubscribe();
    expect(result?.length).toEqual(2);
    expect(result?.[0]).toEqual({ label: 'common.home', link: '/' });
    expect(result?.[1]).toEqual({
      label: 'child route breadcrumb',
      link: '/child',
    });
  });

  it(`should resolve robots for page data`, () => {
    let result: PageRobotsMeta[] | undefined;
    service
      .resolveRobots()
      .subscribe((meta) => {
        result = meta;
      })
      .unsubscribe();

    expect(result).toContain(PageRobotsMeta.FOLLOW);
    expect(result).toContain(PageRobotsMeta.INDEX);
  });

  it(`should resolve canonical url`, () => {
    spyOn(pageLinkService, 'getCanonicalUrl');
    service.resolveCanonicalUrl('my-shop.com').subscribe().unsubscribe();
    expect(pageLinkService.getCanonicalUrl).toHaveBeenCalledWith(
      undefined,
      'my-shop.com'
    );
  });
});
