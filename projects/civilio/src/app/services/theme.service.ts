import { isPlatformBrowser } from '@angular/common';
import { DOCUMENT, DestroyRef, Injectable, PLATFORM_ID, RendererFactory2, inject } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { ThemeMode } from '@civilio/shared';
import { Store } from '@ngxs/store';
import { BehaviorSubject, filter } from 'rxjs';
import { currentTheme } from '../state/selectors';

@Injectable({
  providedIn: 'root'
})
export class ThemeService {
  private platformId = inject(PLATFORM_ID);
  private store = inject(Store);
  private renderer = inject(RendererFactory2).createRenderer(null, null);
  private doc = inject(DOCUMENT);
  private destroyRef = inject(DestroyRef);
  private _theme = new BehaviorSubject<ThemeMode>('system');
  public readonly theme$ = this._theme.asObservable();
  private mediaQueryList?: MediaQueryList;
  constructor() {
    if (isPlatformBrowser(this.platformId)) {
      this.syncFromPrefs();
      this.toggleClassOnThemeChanges();
      this.setupSystemThemeListener();
      this.setupPrefsThemeListener();
    } else {
      this._theme.next('system');
    }
  }

  /**
   * Reads the theme from localStorage and sets it as the initial theme.
   * If no theme is found, it defaults to 'system'.
   */
  private syncFromPrefs(): void {
    const prefTheme = this.store.selectSnapshot(currentTheme);
    this._theme.next(prefTheme || 'system'); // Default to 'system' if nothing in storage
  }

  /**
   * Subscribes to theme changes and applies/removes the 'dark' class on the <html> element.
   */
  private toggleClassOnThemeChanges(): void {
    this.theme$.pipe(
      takeUntilDestroyed(this.destroyRef)
    ).subscribe(t => {
      if (t === 'dark' || (t === 'system' && this.isSystemDark())) {
        this.renderer.addClass(this.doc.documentElement, 'dark');
      } else {
        // Only remove 'dark' if it's currently present and not needed
        if (this.doc.documentElement.classList.contains('dark')) {
          this.renderer.removeClass(this.doc.documentElement, 'dark');
        }
      }
    });
  }

  /**
   * Sets up or tears down the listener for system theme changes.
   * This is only active when the current theme is 'system'.
   */
  private setupSystemThemeListener(): void {
    this.theme$.pipe(
      takeUntilDestroyed(this.destroyRef),
      filter(() => isPlatformBrowser(this.platformId)) // Ensure we only run this in the browser
    ).subscribe(theme => {
      if (theme === 'system') {
        if (!this.mediaQueryList) {
          this.mediaQueryList = window.matchMedia('(prefers-color-scheme: dark)');
          // When the system preference changes, emit 'system' again to re-evaluate the class
          this.mediaQueryList.onchange = (e: MediaQueryListEvent) => {
            this._theme.next('system'); // Re-emit 'system' to trigger class update
          };
        }
      } else if (this.mediaQueryList) {
        this.mediaQueryList.onchange = null;
        this.mediaQueryList = undefined;
      }
    });
  }

  /**
   * Helper to check if the system prefers dark mode.
   */
  private isSystemDark(): boolean {
    return isPlatformBrowser(this.platformId) && window.matchMedia('(prefers-color-scheme: dark)').matches;
  }

  private setupPrefsThemeListener() {
    this.store.select(currentTheme).pipe(
      takeUntilDestroyed(this.destroyRef)
    ).subscribe(v => this._theme.next(v));
  }
}
