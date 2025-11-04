import { inject, Injectable } from '@angular/core';
import { CONFIG_SERVICE } from '@app/services/config';
import { AppConfig, AppConfigSchema, DbConfigSchema } from '@civilio/shared';
import { TranslateService } from '@ngx-translate/core';
import { Action, NgxsOnInit, State, StateContext, StateToken } from '@ngxs/store';
import { patch } from '@ngxs/store/operators';
import { concatMap, from, tap, throwError } from 'rxjs';
import { LoadConfig, SetFontSize, SetLocale, SetTheme, TestDb, UpdateMiscConfig } from './actions';

export * from './actions';
type ConfigStateModel = {
	config?: AppConfig;
	configured: boolean;
	env: 'desktop' | 'web';
}
type Context = StateContext<ConfigStateModel>;
export const CONFIG_STATE = new StateToken<ConfigStateModel>('config');

@Injectable()
@State({
	name: CONFIG_STATE,
	defaults: { configured: false, env: 'desktop' }
})
export class ConfigState implements NgxsOnInit {
	private readonly configService = inject(CONFIG_SERVICE);
	private readonly translateService = inject(TranslateService);

	ngxsOnInit(ctx: Context): void {
		const state = ctx.getState();
		const lang = (state.config?.prefs?.locale ?? 'en-CM').substring(0, 2);
		this.translateService.use(lang);
	}

	@Action(UpdateMiscConfig)
	onUpdateMiscConfig(ctx: Context, { path, value }: UpdateMiscConfig) {
		return from(this.configService.updateMisc(path, value)).pipe(
			tap(config => ctx.setState(patch({
				config,
				configured: 'db' in config && DbConfigSchema.safeParse(config.db).success
			}))),
		);
	}

	@Action(SetFontSize)
	onSetFontSize(ctx: Context, { size }: SetFontSize) {
		return from(this.configService.setFontSize(size)).pipe(
			tap(config => ctx.setState(patch({
				config,
				configured: 'db' in config && DbConfigSchema.safeParse(config.db).success
			})))
		)
	}

	@Action(TestDb, { cancelUncompleted: true })
	onTestDb(ctx: Context, action: TestDb) {
		return from(this.configService.testDb(action)).pipe(
			concatMap(v => {
				if (v === true) return this.configService.setDbConfig(action);
				return throwError(() => new Error(v));
			}),
			tap(config => ctx.setState(patch({
				config: config ?? undefined,
				configured: config != null && 'db' in config && DbConfigSchema.safeParse(config.db).success
			})))
		)
	}

	@Action(SetLocale, { cancelUncompleted: true })
	onSetLocale(ctx: Context, { locale }: SetLocale) {
		return from(this.configService.setLocale(locale)).pipe(
			tap(config => ctx.setState(patch({
				config,
				configured: 'db' in config && DbConfigSchema.safeParse(config.db).success
			}))),
			tap(() => this.translateService.use(locale.substring(0, 2)))
		)
	}

	@Action(SetTheme, { cancelUncompleted: true })
	onSetTheme(ctx: Context, { value }: SetTheme) {
		return from(this.configService.setTheme(value)).pipe(
			tap(config => ctx.setState(patch({
				config,
				configured: 'db' in config && DbConfigSchema.safeParse(config.db).success
			})))
		);
	}

	@Action(LoadConfig)
	onLoadConfig(ctx: Context) {
		return from(this.configService.loadConfig()).pipe(
			tap(config => ctx.setState(patch({
				config,
				configured: config && config.db && Object.keys(config.db ?? {}).length > 0 && AppConfigSchema.unwrap().shape.db.unwrap().safeParse(config.db).success
			}))),
			tap(config => {
				const lang = (config?.prefs?.locale ?? 'en-CM').substring(0, 2);
				this.translateService.use(lang);
			})
		)
	}
}
