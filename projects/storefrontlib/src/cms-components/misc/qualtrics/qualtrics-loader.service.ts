import {
  Injectable,
  isDevMode,
  Renderer2,
  RendererFactory2,
} from '@angular/core';
import { WindowRef } from '@spartacus/core';
import { fromEvent, Observable, of } from 'rxjs';
import { filter, map, switchMap, tap } from 'rxjs/operators';

export const QUALTRICS_EVENT_NAME = 'qsi_js_loaded';

/**
 * @deprecated since 3.1 - moved to feature-lib
 * Please take a look at https://sap.github.io/spartacus-docs/qualtrics-integration/#page-title
 * to see how to migrate into the new feature-lib.
 * Do not import from the storefront. Instead import from the qualtrics feature-lib.
 *
 * Service to integration Qualtrics.
 *
 * The integration observes the Qualtrics API, and when available, it runs the QSI API
 * to let Qualtrics evaluate the application.
 *
 * The service supports an additional _hook_ (`isDataLoaded()`) that can be used to load application
 * data before pulling the QSI API. This is beneficial in a single page application when additional
 * data is required before the Qualtrics _creatives_ run.
 *
 * This service also supports the creation of the Qualtrics deployment script. This is optional, as
 * the script can be added in alternatives ways.
 */
@Injectable({
  providedIn: 'root',
})
export class QualtricsLoaderService {
  /**
   * Reference to the QSI API.
   */
  protected qsiApi: any;

  /**
   * QSI load event that happens when the QSI JS file is loaded.
   */
  private qsiLoaded$: Observable<any> = this.winRef?.nativeWindow
    ? fromEvent(this.winRef.nativeWindow, QUALTRICS_EVENT_NAME)
    : of();

  /**
   * Emits the Qualtrics Site Intercept (QSI) JavaScript API whenever available.
   *
   * The API is emitted when the JavaScript resource holding this API is fully loaded.
   * The API is also stored locally in the service, in case it's required later on.
   */
  protected qsi$: Observable<any> = this.qsiLoaded$.pipe(
    switchMap(() => this.isDataLoaded()),
    map(() => this.winRef?.nativeWindow['QSI']),
    filter((api) => Boolean(api)),
    tap((qsi) => (this.qsiApi = qsi))
  );

  constructor(
    protected winRef: WindowRef,
    protected rendererFactory: RendererFactory2
  ) {
    this.initialize();
  }

  /**
   * Adds the deployment script to the DOM.
   *
   * The script will not be added twice if it was loaded before. In that case, we use
   * the Qualtrics API directly to _unload_ and _run_ the project.
   */
  addScript(scriptSource: string): void {
    if (this.hasScript(scriptSource)) {
      this.run(true);
    } else {
      const script: HTMLScriptElement = this.renderer.createElement('script');
      script.type = 'text/javascript';
      script.defer = true;
      script.src = scriptSource;
      this.renderer.appendChild(this.winRef.document.body, script);
    }
  }

  /**
   * Indicates if the script is already added to the DOM.
   */
  protected hasScript(source?: string): boolean {
    return !!this.winRef.document.querySelector(`script[src="${source}"]`);
  }

  /**
   * Starts observing the Qualtrics integration. The integration is based on a
   * Qualtrics specific event (`qsi_js_loaded`). As soon as this events happens,
   * we run the API.
   */
  protected initialize() {
    this.qsi$.subscribe(() => this.run());
  }

  /**
   * Evaluates the Qualtrics project code for the application.
   *
   * In order to reload the evaluation in Qualtrics, the API requires to unload the API before
   * running it again. We don't do this by default, but offer a flag to conditionally unload the API.
   */
  protected run(reload = false): void {
    if (!this.qsiApi?.API) {
      if (isDevMode()) {
        console.log('The QSI api is not available');
      }
      return;
    }

    if (reload) {
      // Removes any currently displaying creatives
      this.qsiApi.API.unload();
    }

    // Starts the intercept code evaluation right after loading the Site Intercept
    // code for any defined intercepts or creatives
    this.qsiApi.API.load().done(this.qsiApi.API.run());
  }

  /**
   * This logic exist in order to let the client(s) add their own logic to wait for any kind of page data.
   * You can observe any data in this method.
   *
   * Defaults to true.
   */
  protected isDataLoaded(): Observable<boolean> {
    return of(true);
  }

  protected get renderer(): Renderer2 {
    return this.rendererFactory.createRenderer(null, null);
  }
}
